Ext.define('changeset.ui.ChangesetBrowser', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.changesetbrowser',
    require: ['changeset.ui.ChangesetGrid'],
    cls: 'changeset-browser',
    layout: {
        type: 'accordion',
        animate: true
    },

    /**
     * @cfg
     * Adapter to use for retrieving data.
     */
    adapter: null,

    initComponent: function() {
        this.callParent(arguments);
        this._addGrid();
    },

    _addGrid: function() {
        this.adapter.getCommitStore(function(store) {
            var grid = this.add(
                {
                    xtype: 'changesetgrid',
                    margin: '10 0 0 0',
                    autoScroll: true,
                    model: 'changeset.model.Commit',
                    store: store
                }
            );
            grid.setTitle('Commits');
            grid.getStore().load();
            ////        this.mon(grid, 'revisionClicked', this._showRevision, this);

        }, this);
    }

//    _showRevision: function(record) {
//        if (this.items.getCount() > 1) {
//            this.remove(this.items.getAt(1));
//        }
//        var revision = this.add({
//            xtype: 'changeset',
//            title: 'Revision: ' + record.get('Revision'),
//            autoScroll: true,
//            record: record
//        });
//        revision.expand();
//    }
});