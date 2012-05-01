Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    require: ['changeset.data.GithubAdapter', 'changeset.ui.ChangesetBrowser'],
    componentCls: 'app',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    launch: function() {
        var adapter = Ext.create('changeset.data.GithubAdapter');
        adapter.init(this._onAdapterInit, this);
    },

    _onAdapterInit: function(adapter) {
        this.add({
            html: 'Repository: <a href="' + adapter.getRepositoryUrl() + '" target="_blank">' + adapter.repository + '</a>',
            margin: '5 5 0 5',
            border: 0
        });

        this.add({
            xtype: 'changesetbrowser',
            margin: '0 5 5 5',
            border: 0,
            adapter: adapter,
            flex: 1
        });
    }
});
