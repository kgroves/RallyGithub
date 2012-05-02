Ext.define('changeset.ui.ChangesetBrowser', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.changesetbrowser',
    require: ['changeset.ui.ChangesetGrid', 'changeset.ui.Changeset'],
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
        var callback = function(store) {
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
            this.mon(grid, 'artifactClicked', this._showArtifact, this);
            this.mon(grid, 'revisionClicked', this._showRevision, this);
        };
        this.adapter.getCommitStore(callback, this);
    },

    _showArtifact: function(formattedId) {
        Ext.data.JsonP.request({
            url: Rally.environment.getServer().getWsapiUrl() + '/artifact.js',
            method: 'GET',
            callbackKey: 'jsonp',
            params: {
                query: '(FormattedID = ' + formattedId + ')'
            },
            success: this._onFormattedIdLoad,
            scope: this
        });
    },

    _onFormattedIdLoad: function(result) {
        if (result.QueryResult) {
            var results = result.QueryResult.Results;
            if (results && results.length) {
                var ref = results[0]._ref;
                var detailLink = Rally.util.Navigation.createRallyDetailUrl(ref);
                window.open(detailLink, 'detailpage');
            }
        }
    },

    _showRevision: function(record) {
        if (this.items.getCount() > 1) {
            this.remove(this.items.getAt(1));
        }
        var revision = this.add({
            xtype: 'changeset',
            adapter: this.adapter,
            title: 'Revision: ' + record.get('revision'),
            autoScroll: true,
            record: record
        });
        revision.expand();
    }
});