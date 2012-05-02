Ext.define('changeset.ui.Changeset', {
    extend: 'Ext.panel.Panel',
    require: ['changeset.ui.ChangesetSummary'],
    alias: 'widget.changeset',
    cls: 'changeset',

    /**
     * @cfg
     * Adapter to use for retrieving data.
     */
    adapter: null,

    initComponent: function() {
        this.callParent(arguments);
        this.on('afterrender', this._onAfterRender, this, {single: true});
    },

    _loadChangesetStore: function() {
        this.adapter.getChangesetStore(this.record, function(store) {
            this.mon(store, 'load', this._onChangesetStoreLoad, this, {single: true});
            store.load();
        }, this);
    },

    _onChangesetStoreLoad: function(store) {
        var grid = this.insert( 1,
            {
                xtype: 'changesetfilesgrid',
                margin: 10,
                border: 0,
                store: store
            }
        );
    },

    _renderChangeset: function() {
        if (!this.record) {
            return;
        }

        this.add({
            xtype: 'changesetsummary',
            margin: 10,
            border: 0,
            record: this.record
        });

        this._loadChangesetStore();
    },

    _onAfterRender: function() {
        this._renderChangeset();
    }
});