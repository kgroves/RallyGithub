Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    require: ['changeset.data.GithubAdapter', 'changeset.ui.ChangesetBrowser'],
    componentCls: 'app',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    launch: function() {
        this.adapter = Ext.create('changeset.data.GithubAdapter');
        this.mon(this.adapter, 'ready', this._onAdapterReady, this);
        this.mon(this.adapter, 'authenticationrequired', this._onAuthenticationRequired, this);
        this.adapter.init();
    },

    _onAdapterReady: function(adapter) {
        this.removeAll();

        this.add({
            xtype: 'changesetbrowser',
            margin: '0 5 5 5',
            border: 0,
            adapter: adapter,
            flex: 1
        });
    },

    _onAuthenticationRequired: function(adapter) {
        this.removeAll();
        this.add({
            flex: 1,
            border: 0,
            adapter: this.adapter,
            items: [{
                xtype: 'changesetlogin',
                border: 0,
                adapter: adapter
            }]
        });
    }
});
