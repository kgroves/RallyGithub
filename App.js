Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    require: ['changeset.data.GithubAdapter', 'changeset.ui.ChangesetBrowser'],
    componentCls: 'app',
    layout: 'fit',

    launch: function() {
        var adapter = Ext.create('changeset.data.GithubAdapter');
        adapter.init(this._onAdapterInit, this);
    },

    _onAdapterInit: function(adapter) {
        this.add({
            xtype: 'changesetbrowser',
            margin: 5,
            border: 0,
            adapter: adapter
        });
    }
});
