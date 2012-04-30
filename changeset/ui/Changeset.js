Ext.define('changeset.ui.Changeset', {
    extend: 'Ext.panel.Panel',
    require: ['changeset.ui.ChangesetSummary', 'changeset.adapter.CGit'],
    alias: 'widget.changeset',
    cls: 'changeset',

    initComponent: function() {
        this.callParent(arguments);
        this.on('afterrender', this._onAfterRender, this, {single: true});
    },

    _loadChangesetModel: function() {
        Rally.data.ModelFactory.getModel({
            type: 'Change',
            success: this._onChangeModelLoad,
            scope: this
        });
    },

    _onChangeModelLoad: function(model) {
        var grid = this.insert(1,
            {
                xtype: 'changesetfilesgrid',
                hideHeaders: true,
                margin: 10,
                border: 0,
                model: model,
                record: this.record
            }
        );
    },

    _loadRevisionDiff: function() {
        // We intend for these adapters to be easily swappable,
        // so they should follow the same public interface as CGit.
        var adapter = Ext.create('changeset.adapter.CGit', {
            revision: this.record.get('Revision'),
            uri: this.record.get('Uri')
        });
        adapter.getRevisionDiff(this._onRevisionDiffLoad, this);
    },

    _onRevisionDiffLoad: function(rawDiff) {
        console.log(rawDiff);
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

        this._loadChangesetModel();

        this._loadRevisionDiff();
    },

    _onAfterRender: function() {
        this._renderChangeset();
    }
});