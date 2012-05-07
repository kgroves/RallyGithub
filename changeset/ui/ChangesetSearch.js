Ext.define('changset.ui.ChangesetSearch', {
    extend: 'Ext.form.Panel',
    alias: 'widget.changesetsearch',
    cls: 'changeset-search',
    border: 0,
//    layout: {
//        type: 'hbox',
//        align: 'right'
//    },

    grid: null,

    items: [{
        xtype: 'textfield',
        itemId: 'SearchText',
        name: 'search',
        width: 300
    },{
        xtype: 'rallybutton',
        itemId: 'SearchButton',
        text: 'Filter',
        margin: '0 0 0 10'
    }],

    initComponent: function() {
        this.callParent(arguments);
        this.mon(this.down('#SearchButton'), 'click', this._onSearchClick, this, {});
    },

    _onSearchClick: function() {
        var value = this.down('#SearchText').getValue();
        var grid = Ext.ComponentQuery.query('changesetgrid')[0];

        if(!(value && grid)) {
            return;
        }
        var filter = new Ext.util.Filter({
           filterFn: function(record) {
               return record.get('message').toLowerCase().indexOf(value.toLowerCase()) !== -1;
           }
        });

        grid.filter(filter, true, false);

        this.add({
            xtype: 'rallybutton',
            itemId: 'ClearButton',
            text: 'Clear Filter',
            margin: '0 0 0 10',
            listeners: {
                click: {
                    fn: function() {
                        var grid = Ext.ComponentQuery.query('changesetgrid')[0];
                        grid.getStore().clearFilter();
                        this.down('#SearchText').setValue('');
                        this.remove(this.down('#ClearButton'));
                    }
                },
                scope: this
            }
        });
    }
});