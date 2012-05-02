Ext.define('changeset.ui.ChangesetSummary', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.changesetsummary',
    cls: 'changeset-summary',
    frame: true,
    dockedItems: [{
        xtype: 'toolbar',
        itemId: 'bottomToolbar',
        dock: 'bottom',
        border: 0
    }],

    initComponent: function() {
        this.callParent(arguments);
        this._initItems();
    },
    
    _initItems: function() {
        if (!this.record) {
            return;
        }

        this.html = '<p>' + this.record.get('message') + '</p>';

        this.getComponent('bottomToolbar').add([
            {
                html: this.record.get('author').name
            },{
                html: Ext.Date.format(new Date(this.record.get('timestamp')), 'Y-m-d h:i:s A')
            },{
                html: this.record.get('revision')
            }
        ]);
    }
});