/**
 * Store for loading {changeset.model.Commit} records from Github.
 */
Ext.define('changeset.data.github.CommitStore', {
    extend: 'Ext.data.Store',
    require: [
        'changeset.model.Commit',
        'changeset.data.github.Proxy'
    ],

    model: 'changeset.model.Commit',

    /**
     * Github's commit endpoint's paging is a little funky.
     *
     * You must specify a sha to page to,
     * instead of a normal page number.
     */
    loadPage: function(page, options) {
        this._addShaToOptions(page);
        return this.callParent(arguments)
    },

    _addShaToOptions: function(page) {
        if (this.proxy) {
            var sha;
            if (page === 1) {
                sha = this.startSha;
            } else {
                var lastCommitIdx = ((page - 1) * this.pageSize) - 1;
                var lastCommit = this.getAt(lastCommitIdx);
                sha = lastCommit.get('revision');
            }

            if (!this.proxy.extraParams) {
                this.proxy.extraParams = {};
            }
            this.proxy.extraParams.sha = sha;
        }
    }
});