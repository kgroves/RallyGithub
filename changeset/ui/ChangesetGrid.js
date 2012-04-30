Ext.define('changeset.ui.ChangesetGrid', {
    extend: 'Rally.ui.grid.Grid',
    require: ['Rally.util.Navigation'],
    alias: 'widget.changesetgrid',
    cls: 'changeset-grid',

    columnCfgs: [
        {
            header: 'Message',
            dataIndex: 'message',
            flex: 1
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
//        this.addEvents('revisionClicked');
//
//        this.on('itemclick', this._onRevisionClick, this, {
//            delegate: '.changeset-revision-link',
//            stopEvent: true
//        });
    },

    _onRevisionClick: function(grid, record) {
        this.fireEvent('revisionClicked', record);
    },

//    _onStoreLoad: function(store) {
//        store.each(function(record) {
//            var rawMsg = record.get('Message');
//            var msg = rawMsg.replace(/^.+[\+\-]\d{4}\s+/m, '');
//            msg = msg.replace(/\s[ADRM]\s.+$/m, '');
//            record.set('FormattedMessage', msg);
//
//            var auth = rawMsg.replace(/^.+Author:\s+/im, '');
//            auth = auth.replace(/\s+Date:.+$/im, '');
//            record.set('FormattedAuthor', auth);
//
//            var rawDate = record.get('CommitTimestamp');
//            record.set('FormattedCommitTimestamp', Ext.util.Format.date(rawDate, 'Y-m-d h:i:s A'));
//        });
//    }
});