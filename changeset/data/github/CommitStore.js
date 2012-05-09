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
        if (page > 1) {
            // temporarily increase page size since we will get a duplicate commit back.
            this.pageSize++;
        }
        var result = this.callParent(arguments);
        if (page > 1) {
            this.pageSize--;
        }
        return result;
    },

    /**
     * Overridden to remove duplicate row.
     * @private
     */
    onProxyLoad: function(operation) {
        if (operation && operation.page > 1 && operation.resultSet) {
            var resultSet = operation.resultSet;
            if (resultSet.records && resultSet.records.length > 0) {
                resultSet.records.shift();
                resultSet.count--;
                resultSet.total--;
                resultSet.totalRecords--;
            }
        }
        return this.callParent(arguments);
    },

    _addShaToOptions: function(page) {
        if (this.proxy) {
            var sha,
                data = this.snapshot || this.data;
            if (page === 1) {
                sha = this.startSha;
            } else {
                var lastCommitIdx = ((page - 1) * this.pageSize) - 1;
                var lastCommit = data.getAt(lastCommitIdx);
                sha = lastCommit.get('revision');
            }

            if (!this.proxy.extraParams) {
                this.proxy.extraParams = {};
            }
            this.proxy.extraParams.sha = sha;
        }
    }
});