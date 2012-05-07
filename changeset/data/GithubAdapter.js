/**
 * Adapter classes contain methods to construct Store objects for use by ui components.
 */
Ext.define('changeset.data.GithubAdapter', {
    require: ['changeset.model.Changeset', 'changeset.data.GithubProxy'],
    mixins: {
        observable: 'Ext.util.Observable',
        stateful: 'Ext.state.Stateful'
    },

    /**
     * @cfg
     * Github username
     */
    username: null,

    /**
     * @cfg
     * Github repository name
     */
    repository: null,

    /**
     * @cfg
     * OAuth token for Github api
     */
    authToken: null,

    /**
     * @cfg
     * Branch to grab commits from
     */
    branch: null,

    /**
     * @cfg
     * Base url for all Github api requests.
     */
    apiUrl: 'https://api.github.com',

    /**
     * stateful configs
     */
    stateful: true,
    stateEvents: ['ready', 'statechange'],
    stateId: window.location.href + 'githubAdapter',

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
            'authenticationrequired',
            /**
             * @event
             * Fired when the state needs to be saved.
             */
            'statechange'
        );

        this.mixins.observable.constructor.apply(this, arguments);
        this.mixins.stateful.constructor.apply(this, arguments);

        Ext.Ajax.on('beforerequest', this._onBeforeAjaxRequest, this);

        this._init();
    },

    /**
     * Get current state.
     */
    getState: function() {
        return {
            username: this.username,
            authToken: this.authToken,
            repository: this.repository,
            branch: this.branch
        };
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
        return 'https://github.com/' + this._getRepoPath();
    },

    /*
     * Gets the currently selected repository.
     */
    getRepository: function() {
        return this.repository;
    },

    /*
     * Set the repository to fetch data from.
     */
    setRepository: function(repository) {
        if( !this.repository || this.repository.name !== repository.raw.name ) {
            this.branch = null;
        }
        this.repository = repository.raw;
        this.fireEvent('statechange', this);
    },

    /*
     * Gets the currently selected branch.
     */
    getBranch: function() {
        return this.branch;
    },

    /*
     * Set the branch to fetch data from.
     */
    setBranch: function(branch) {
        this.branch = branch.raw;
        this.fireEvent('statechange', this);
    },

    /**
     * Constructs a store which populates repository models.
     */
    getRepositoryStore: function(callback, scope) {
        var url = [
            this.apiUrl,
            'user',
            'repos'
        ].join('/');

        var store = Ext.create('Ext.data.Store', {
            model: 'changeset.model.Repository',
            proxy: Ext.create('changeset.data.GithubProxy', {
                url: url
            })
        });

        callback.call(scope, store);
    },

    /**
     * Constructs a store which populates branch models.
     */
    getBranchStore: function(callback, scope) {
        var url = [
            this.apiUrl,
            'repos',
            this._getRepoPath(),
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
            this._getRepoPath(),
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
        Ext.state.Manager.getProvider().clear(this.getStateId());
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

    _getRepoPath: function() {
        return this.repository.owner.login + '/' + this.repository.name;
    },

    /**
     * Initializes the adapter.
     */
    _init: function() {
        if (!Ext.isEmpty(this.authToken)) {
            this.fireEvent('ready', this);
        } else {
            this.fireEvent('authenticationrequired', this);
        }
    },

    _onBeforeAjaxRequest: function(ext, opts) {
        this._stripRallyHeaders(opts);
        if (!opts.headers.hasOwnProperty('Authorization')) {
            opts.headers.Authorization = 'token ' + this.authToken;
        }
    },

    _onBranchLoad: function(store, callback, scope) {
        var url = [
            this.apiUrl,
            'repos',
            this._getRepoPath(),
            'commits'
        ].join('/');

        var branchStore = Ext.create('Ext.data.Store', {
            model: 'changeset.model.Commit',
            proxy: Ext.create('changeset.data.GithubProxy', {
                url: url,
                extraParams: {
                    sha: this.branch.commit.sha
                },
                reader: {
                    type: 'json',
                    extractValues: changeset.data.GithubProxy.extractCommitValues
                }
            })
        });
        callback.call(scope, branchStore);
    },

    _getChangeset: function(record, callback, scope) {
        var url = [
            this.apiUrl,
            'repos',
            this._getRepoPath(),
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
                callback.call(scope, data);
            },
            scope: this
        });
    }
});