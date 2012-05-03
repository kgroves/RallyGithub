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

    unifiedDiffRegex: /^@@\s\-(\d+)(,\d+)?\s\+(\d+)(,\d+)?\s@@/,

    initComponent: function() {
        this.callParent(arguments);
        this.getComponent('topToolbar').add([
            {
                html: this.record.get('filename'),
                flex: 1
            }
        ]);

        var diffLines = this.record.get('diff').split("\n");
        var lineNumbers;
        Ext.each(diffLines, function(line) {
            lineNumbers = this._getLineNumbers(line, lineNumbers);

            this.add([
            {
                html: lineNumbers.oldLineSymbol
            },{
                html: lineNumbers.newLineSymbol
            },{
                html: '<pre class="prettyprint">'+ line +'</pre>',
                colspan: 3,
                border: 0,
                cls: this._addLineCls(line)
            }]);
        }, this);
        prettyPrint();
    },

    _addLineCls: function(line) {
        var lineType = this._getLineType(line);
        if( lineType === '+' ) {
            return 'line-add';
        } else if( lineType === '-' ) {
            return 'line-remove';
        } else {
            return null;
        }
    },

    _getLineNumbers: function(line, lineNumbers) {
        var diffMatch = this.unifiedDiffRegex.exec(line);
        if (diffMatch) {
            lineNumbers = {
                oldLineNumber: parseInt(diffMatch[1], 10),
                newLineNumber: parseInt(diffMatch[3], 10),
                oldLineSymbol: 'old',
                newLineSymbol: 'new'
            }
        } else {
            var lineType = this._getLineType(line);
            if (lineType === '+') {
                this._incrementLineNumber(lineNumbers, false, true);
            } else if (lineType === '-') {
                this._incrementLineNumber(lineNumbers, true, false);
            } else {
                this._incrementLineNumber(lineNumbers, true, true);
            }
        }

        return lineNumbers;
    },

    _incrementLineNumber: function(lineNumbers, incrementOld, incrementNew) {
        if (incrementOld) {
            lineNumbers.oldLineSymbol = lineNumbers.oldLineNumber.toString();
            lineNumbers.oldLineNumber++;
        } else {
            lineNumbers.oldLineSymbol = '+';
        }

        if (incrementNew) {
            lineNumbers.newLineSymbol = lineNumbers.newLineNumber.toString();
            lineNumbers.newLineNumber++;
        } else {
            lineNumbers.newLineSymbol = '-';
        }
    },

    _getLineType: function(line) {
        var marker = line.substring(0,1);
        if (marker === '+') {
            return marker;
        } else if (marker === '-') {
            return marker;
        }

        return '=';
    }
});