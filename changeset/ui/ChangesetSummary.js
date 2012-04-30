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
        
        this.html = '<p>' + this.record.get('FormattedMessage') + '</p>';

        this.getComponent('bottomToolbar').add([
            {
                html: this.record.get('FormattedAuthor')
            },
            {
                html: this.record.get('FormattedCommitTimestamp')
            },
            {
                html: this.record.get('Revision')
            }
        ]);
    }
});