Ext.define('changeset.ui.ChangesetFilesGrid', {
    extend: 'Rally.ui.grid.Grid',
    alias: 'widget.changesetfilesgrid',
    cls: 'changeset-files-grid',
    storeConfig: {
        fetch: true,
        sorters: [{
            property: 'PathAndFilename',
            direction: 'ASC'
        }]
    },
    columnCfgs: [
        {
            dataIndex: 'Action',
            width: 20
        },
        {
            xtype: 'templatecolumn',
            tpl: '<a href="{Uri}">{PathAndFilename}</a>',
            flex: 1
        }
    ],

    constructor: function(config) {
        config = config || {};
        Ext.applyIf(config, {
            columnCfgs: this.columnCfgs,
            storeConfig: this.storeConfig
        });

        this.callParent([config]);

        this.storeConfig.filters = [{
            property: 'changeset',
            operator: '=',
            value: this.record.get('_ref')
        }];
    }
});