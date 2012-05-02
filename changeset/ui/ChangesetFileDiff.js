Ext.define('changeset.ui.ChangesetFileDiff', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.changesetfilediff',
    cls: 'changeset-file-diff',
    dockedItems: [{
        xtype: 'toolbar',
        itemId: 'topToolbar',
        dock: 'top',
        border: 0
    }],

    initComponent: function() {
        this.callParent(arguments);
        this.getComponent('topToolbar').add([
            {
                html: this.record.get('filename'),
                flex: 1
            }
        ]);

        this.add({
            html: '<pre>' + this.record.get('diff') + '</pre>',
            border: 0
        });
    }
});