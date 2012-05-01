Ext.define('changeset.ui.ChangesetGrid', {
    extend: 'Rally.ui.grid.Grid',
    require: ['Rally.util.Navigation'],
    alias: 'widget.changesetgrid',
    cls: 'changeset-grid',

    /**
     * @cfg
     * Artifact type prefix regexes to match in commit messages.
     */
    artifactRegexes: [
        /(\s+)(DE\d+)/,
        /(\s+)(US\d+)/,
        /(\s+)(TA\d+)/
    ],

    columnCfgs: [
        {
            header: 'Message',
            dataIndex: 'message',
            flex: 1,
            renderer: function(value) {
                Ext.each(this.artifactRegexes, function(artifactRegex) {
                    value = value.replace(artifactRegex, '<a href="#" class="artifact-link">$1$2</a>');
                });
                return value;
            }
        },
        {
            xtype: 'templatecolumn',
            header: 'Author',
            tpl: '{author.name}',
            flex: .3
        },
        {
            xtype: 'datecolumn',
            header: 'Commit Time',
            dataIndex: 'timestamp',
            format: 'Y-m-d h:i:s A',
            width: 140
        },
        {
            header: 'Revision',
            dataIndex: 'revision',
            renderer: function(value) {
                var label = value.substring(0, 12) + '...';
                return Ext.String.format('<a href="#" class="changeset-revision-link">{0}</a>', label);
            },
            width: 85
        }
    ],

    constructor: function(config) {
        config = config || {};
        Ext.applyIf(config, {
            columnCfgs: this.columnCfgs
        });
        this.callParent([config]);
    },

    initComponent: function() {
        this.callParent(arguments);
        this.addEvents(
            /**
             * @event
             * fired when a revision is clicked.
             */
            'revisionClicked',
            /**
             * @event
             * fired when an artifact is clicked.
             */
            'artifactClicked'
        );

        this.on('itemclick', this._onArtifactClick, this, {
            delegate: '.artifact-link',
            stopEvent: true
        });
    },

    _onArtifactClick: function(grid, record, dom, anon, evt) {
        this.fireEvent('artifactClicked', evt.target.innerHTML);
    },

    _onRevisionClick: function(grid, record) {
        this.fireEvent('revisionClicked', record);
    }
});