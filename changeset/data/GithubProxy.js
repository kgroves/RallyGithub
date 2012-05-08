Ext.define('changeset.data.GithubProxy', {
    extend: 'Ext.data.proxy.Rest',

    statics: {
        /**
         * extract functions are used to normalize data objects
         */
        extractCommitValues: function(data) {
            var output = {
                revision: data.sha,
                url: data.url,
                author: data.author,
                avatarUrl: data.author ? data.author.avatar_url : null,
                parents: data.parents
            };

            var commit = data.commit;
            if (commit) {
                Ext.apply(output, commit);
                output.timestamp = commit.author.date;
            }
            return output;
        },

        extractChangesetFileValues: function(data) {
            var output = {
                status: data.status,
                filename: data.filename,
                url: data.raw_url,
                deletions: data.deletions,
                additions: data.additions,
                changes: data.changes,
                diff: data.patch
            };
            return output;
        },
        
        extractCommentValues: function(data) {
            var output = {
                revision: data.commit_id,
                filename: data.path,
                lineNumber: data.position,
                comment: data.body,
                timestamp: data.created_at,
                user: data.user,
                avatarUrl: data.user ? data.user.avatar_url : null,
            };
            return output;
        }
    },

    cors: true,
    stripRallyHeaders: true,
    pageParam: 'page',
    limitParam: 'per_page',
    startParam: undefined
});