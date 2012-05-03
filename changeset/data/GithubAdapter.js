/**
 * Adapter classes contain methods to construct Store objects for use by ui components.
 */
Ext.define('changeset.data.GithubAdapter', {
    extend: 'Ext.util.Observable',
    require: ['changeset.model.Changeset', 'changeset.data.GithubProxy'],

    /**
     * @cfg
     * Github username
     */
    username: 'rally-dthompson',

    /**
     * @cfg
     * Github password
     */
    password: '',

    /**
     * @cfg
     * Github repository name
     */
    repository: 'RallyGithub',

    /**
     * @cfg
     * Branch to grab commits from
     */
    branch: 'master',

    /**
     * @cfg
     * Base url for all Github api requests.
     */
    apiUrl: 'https://api.github.com',

    /**
     * @cfg
     * OAuth token for Github api
     */
    authToken: "57e6c432f1d0341be88703768399b9fb90b891f4",

    constructor: function(config) {
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event
             * Fired when the adapter is ready to be used.
             */
            'ready'
        );

        this.callParent(arguments);

        Ext.Ajax.on('beforerequest', this._onBeforeAjaxRequest, this);
    },

    /**
     * Initializes the adapter.
     */
    init: function(callback, scope) {
        this.on('ready', function() {
            callback.call(scope, this);
        }, this, {single: true});

        this._authenticate();
    },

    /**
     * Return a url to the repository.
     */
    getRepositoryUrl: function() {
        return 'https://github.com/' + this.username + '/' + this.repository;
    },

    /**
     * Constructs a store which populates branch models.
     */
    getBranchStore: function(callback, scope) {
        var url = [
            this.apiUrl,
            'repos',
            this.username,
            this.repository,
            'branches'
        ].join('/');

        var store = Ext.create('Ext.data.Store', {
            model: 'changeset.model.Branch',
            proxy: Ext.create('changeset.data.GithubProxy', {
                url: url
            })
        });

        callback.call(scope, store);
    },

    /**
     * Returns a store which populates commit models.
     */
    getCommitStore: function(callback, scope) {
        this.getBranchStore(function(store) {
            store.on('load', function(store) {
                this._onBranchLoad(store, callback, scope);
            }, this, {single: true});
            store.load();
        }, this);
    },

    /**
     * Returns a store which populates changeset models.
     */
    getChangesetStore: function(record, callback, scope) {
        if (record.get('parents').length < 1) {
            callback.call(scope, null);
            return;
        }

        var url = [
            this.apiUrl,
            'repos',
            this.username,
            this.repository,
            'compare',
            record.get('parents')[0].sha + '...' + record.get('revision')
        ].join('/');

        var store = Ext.create('Ext.data.Store', {
            model: 'changeset.model.ChangesetFile',
            proxy: Ext.create('changeset.data.GithubProxy', {
                url: url,
                reader: {
                    type: 'json',
                    root: 'files',
                    extractValues: changeset.data.GithubProxy.extractChangesetFileValues
                }
            })
        });

        callback.call(scope, store);
    },

    /**
     * Grabs a OAuth token using the current credentials.
     * @private
     */
    _authenticate: function() {
        if (!Ext.isEmpty(this.authToken)) {
            this.fireEvent('ready', this);
            return;
        }

        var encodedAuth = 'Basic ' + btoa(this.username + ':' + this.password);
        Ext.Ajax.request({
            url: this.apiUrl + '/authorizations',
            method: 'POST',
            stripRallyHeaders: true,
            headers: {
                Authorization: encodedAuth
            },
            jsonData: {},
            success: function(response, opts) {
                var data = Ext.decode(response.responseText);
                this.authToken = data.token;
                this.fireEvent('ready', this);
            },
            scope: this
        });
    },

    /**
     * Removes Rally specific headers from Ajax request options.
     */
    _stripRallyHeaders: function(opts) {
        if ((opts.stripRallyHeaders || (opts.scope && opts.scope.stripRallyHeaders)) && opts.headers) {
            delete opts.headers["X-RallyIntegrationLibrary"];
            delete opts.headers["X-RallyIntegrationName"];
        }
    },

    _onBeforeAjaxRequest: function(ext, opts) {
        this._stripRallyHeaders(opts);
    },

    _onBranchLoad: function(store, callback, scope) {
        var branch = store.findRecord('name', this.branch);

        var url = [
            this.apiUrl,
            'repos',
            this.username,
            this.repository,
            'commits'
        ].join('/');

        var store = Ext.create('Ext.data.Store', {
            model: 'changeset.model.Commit',
            proxy: Ext.create('changeset.data.GithubProxy', {
                url: url,
                extraParams: {
                    sha: branch.get('commit').sha
                },
                reader: {
                    type: 'json',
                    extractValues: changeset.data.GithubProxy.extractCommitValues
                }
            })
        });
        callback.call(scope, store);
    },

    _getChangeset: function(record, callback, scope) {
        var url = [
            this.apiUrl,
            'repos',
            this.username,
            this.repository,
            'compare',
            record.get('parents')[0].sha + '...' + record.get('revision')
        ].join('/');

        Ext.Ajax.request({
            url: url,
            method: 'GET',
            stripRallyHeaders: true,
            jsonData: {},
            success: function(response, opts) {
                var data = Ext.decode(response.responseText);
                callback.call(scope, data)
            },
            scope: this
        });
    }
});