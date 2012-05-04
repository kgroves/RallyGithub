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
    username: '',

    /**
     * @cfg
     * Github repository name
     */
    repository: 'RallyGithub',

    /**
     * @cfg
     * OAuth token for Github api
     */
    authToken: '',

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

    constructor: function(config) {
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event
             * Fired when the adapter is ready to be used.
             */
            'ready',
            /**
             * @event
             * Fired when the adapter needs authentication.
             */
            'authenticationrequired'
        );

        this.callParent(arguments);

        Ext.Ajax.on('beforerequest', this._onBeforeAjaxRequest, this);
    },

    /**
     * Initializes the adapter.
     */
    init: function() {
        if (!Ext.isEmpty(this.authToken)) {
            this.fireEvent('ready', this);
        } else {
            this.fireEvent('authenticationrequired', this);
        }
    },

    /**
     * Get an appropriate login message
     */
    getLoginMessage: function() {
        return 'Login to your GitHub account';
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
     * Grabs an OAuth token using the passed credentials.
     * If this is successful, it will fire the 'ready' event,
     * if it fails, it will refire 'authenticationrequired'.
     */
    authenticate: function(username, password) {
        this.username = username;
        var encodedAuth = 'Basic ' + btoa(this.username + ':' + password);
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
            failure: function(response, opts) {
                this.fireEvent('authenticationrequired', this);
            },
            scope: this
        });
    },

    /**
     * Logs user out of github api.
     */
    logout: function() {
        this.repository = null;
        this.branch = null;
        this.username = null;
        this.authToken = null;
        this.fireEvent('authenticationrequired', this);
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
        if (!opts.headers.hasOwnProperty('Authorization')) {
            opts.headers["Authorization"] = 'token ' + this.authToken;
        }
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