Ext.define('changset.ui.ChangesetFilter', {
    extend: 'Ext.form.Panel',
    alias: 'widget.changesetfilter',
    cls: 'changeset-filter',
    border: 0,
    layout: 'hbox',

    items: [{
        xtype: 'textfield',
        itemId: 'FilterText',
        name: 'filtertext',
        width: 250
    },{
        xtype: 'rallybutton',
        itemId: 'FilterButton',
        text: 'Filter',
        margin: '0 0 0 4'
    }],

    initComponent: function() {
        this.callParent(arguments);
        this.mon(this.down('#FilterButton'), 'click', this._onFilterClick, this, {});
    },

    _onFilterClick: function() {
        var value = Ext.String.escape(this.down('#FilterText').getValue());
        var grid = Ext.ComponentQuery.query('changesetgrid')[0];

        if(!(value && grid)) {
            return;
        }

        var filter = Ext.create('Ext.util.Filter', {
            property: 'message',
            root: 'data',
            anyMatch: true,
            value: value
        });
        grid.getStore().clearFilter();
        grid.getStore().filter([filter]);

        if( !this.down('#ClearButton') ) {
            this.add({
                xtype: 'rallybutton',
                itemId: 'ClearButton',
                text: 'Clear Filter',
                margin: '0 0 0 4',
                listeners: {
                    click: {
                        fn: function() {
                            var grid = Ext.ComponentQuery.query('changesetgrid')[0];
                            grid.getStore().clearFilter();
                            this.down('#FilterText').setValue('');
                            this.remove(this.down('#ClearButton'));
                        }
                    },
                    scope: this
                }
            });
        }
    }
});