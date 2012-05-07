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

    columnCfgs: [{
        header: 'Message',
        dataIndex: 'message',
        itemId: 'messageCol',
        flex: 1,
        renderer: function(value) {
            Ext.each(this.artifactRegexes, function(artifactRegex) {
                value = value.replace(artifactRegex, '<a href="#" class="artifact-link">$1$2</a>');
            });
            return value;
        }
    },{
        xtype: 'templatecolumn',
        header: 'Author',
        tpl: '{author.name}',
        flex: 0.3
    },{
        xtype: 'datecolumn',
        header: 'Commit Time',
        dataIndex: 'timestamp',
        format: 'Y-m-d h:i:s A',
        width: 160
    },{
        header: 'Revision',
        dataIndex: 'revision',
        renderer: function(value) {
            return Ext.String.format('<a href="#" class="revision-link">{0}</a>', value);
        },
        width: 85
    }],

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

        this.on('render', this._onRender, this);
    },

    _onRender: function() {
        var el = this.getEl();
        el.on('click', this._onArtifactClick, this, {delegate: 'a.artifact-link'});
        el.on('click', this._onRevisionClick, this, {delegate: 'a.revision-link'});
    },

    _onArtifactClick: function(event, dom, opts) {
        this.fireEvent('artifactClicked', dom.innerHTML);
    },

    _onRevisionClick: function(event, dom) {
        var record = this.store.findRecord('revision', dom.innerHTML);
        this.fireEvent('revisionClicked', record);
    }
});