Ext.define('changeset.ui.ChangesetFileDiff', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.changesetfilediff',
    cls: 'changeset-file-diff',
    layout: {
        type: 'table',
        columns: 3
    },
    dockedItems: [{
        xtype: 'toolbar',
        itemId: 'topToolbar',
        dock: 'top',
        border: 0
    }],

    initComponent: function() {
        this.callParent(arguments);
        this.getComponent('topToolbar').add([
            {
                html: this.record.get('filename'),
                flex: 1
            }
        ]);

        var diffLines = this.record.get('diff').split("\n");
        Ext.each(diffLines, function(line) {
            var tableRow = this.add({
                html: '<pre class="prettyprint">'+ line +'</pre>',
                colspan: 3,
                border: 0,
                cls: this._addLineCls(line)
            });
        }, this);
        prettyPrint();
    },

    _addLineCls: function(line) {
        var marker = line.substring(0,1);
        if( marker === '+' ) {
            return 'line-add';
        } else if( marker === '-' ) {
            return 'line-remove';
        } else {
            return null;
        }
    }
});