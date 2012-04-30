/**
 * Integrates Github with changeset ui components.
 */
Ext.define('changeset.adapter.Github', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @cfg
     * Github username
     */
    username: '',

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
     * Base url for all Github api requests.
     */
    apiUrl: 'https://api.github.com',

    /**
     * @cfg
     * OAuth token for Github api
     */
    authToken: 'b9cb017fd4a5ab1c722056d145689a52854d41d3',

    constructor: function(config) {
        Ext.apply(this, config);

        this.addEvents([
            /**
             * @event
             *
             * Fired when the adapter is ready to be used.
             */
            'ready'
        ]);

        Ext.Ajax.on('beforerequest', this._onBeforeAjaxRequest, this);

        this._authenticate();
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

    _onBeforeAjaxRequest: function(ext, opts) {
        this._stripRallyHeaders(opts);
    },

    /**
     * Removes Rally specific headers from Ajax request options.
     */
    _stripRallyHeaders: function(opts) {
        if (opts.stripRallyHeaders && opts.headers) {
            delete opts.headers["X-RallyIntegrationLibrary"];
            delete opts.headers["X-RallyIntegrationName"];
        }
    }
});