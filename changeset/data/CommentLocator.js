/** Easy comment lookup by path and line number. */
Ext.define('changeset.data.CommentLocator', {
    
    constructor: function(store) {
        this.comments = this._getKeyedComments(store);
    },
    
    /**
     * Returns a comment that belongs to a specific line.
     * 
     * @param {String} path file path
     * @param {String|Int} lineNumber line number.
     * @return {changeset.model.Comment}
     */
    getComments: function(path, lineNumber) {
        var key = this._getCommentKey(path, lineNumber);
        return this.comments[key] || null;
    },
    
    _getCommentKey: function(path, lineNumber) {
        return path + ':' + lineNumber.toString();
    },
    
    _getKeyedComments: function(store) {
        var comments = {};
        store.each(function(record) {
            var key = this._getCommentKey(record.get('filename'), record.get('lineNumber'));
            if (!comments.hasOwnProperty(key)) {
                comments[key] = [];
            }
            comments[key].push(record);
        }, this);
        return comments;
    }
});