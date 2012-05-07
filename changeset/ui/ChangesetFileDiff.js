Ext.define('changeset.ui.ChangesetFileDiff', {
    extend: 'Ext.panel.Panel',
    require: ['changeset.ui.ChangesetSummary'],
    alias: 'widget.changesetfilediff',
    cls: 'changeset-file-diff',
    bodyBorder: false,
    dockedItems: [{
        xtype: 'toolbar',
        itemId: 'topToolbar',
        dock: 'top'
    }],

    /**
     * @cfg
     * @private
     * 
     * Regex used to parse unified diff delimiter.
     */
    unifiedDiffRegex: /^@@\s\-(\d+)(,\d+)?\s\+(\d+)(,\d+)?\s@@/,
    
    /**
     * @cfg {changeset.data.CommentLocator}
     * Comments attached to this commit. Rendered inline.
     */
    commentLocator: null,

    initComponent: function() {
        this.callParent(arguments);
        var link = Ext.String.format('<a href="{0}" class="changeset-file">{1}</a>',
            this.record.get('url'), this.record.get('filename'));
        this.getComponent('topToolbar').add([
            {
                html: link,
                listeners: {
                    afterrender: function(cmp) {
                        cmp.getEl().down('.changeset-file').on('click', function(evt) {
                            evt.stopEvent();
                            window.open(this.record.get('url'), 'changesetFile');
                        }, this);
                    },
                    scope: this
                },
                flex: 1
            }
        ]);

        var source = this._renderSourceTable();
        this.add({
            html: source[0],
            listeners: {
                afterrender: function() {
                    Ext.each(source[1], function(commentConfig){
                        Ext.create('changeset.ui.ChangesetSummary', commentConfig);
                    });
                },
                scope: this
            }
        });
    },

    _renderSourceTable: function() {
        var diffLines = this.record.get('diff').split("\n");
        if (diffLines[diffLines.length - 1] === "\\ No newline at end of file") {
            diffLines.pop();
        }
        var lineDetails,
            commentConfigs = [],
            tableBody = ['<table><tbody>'];
        Ext.each(diffLines, function(line, lineIdx) {
            if (!line) {
                return;
            }
            lineDetails = this._getLineDetails(line, lineDetails);
            tableBody.push(this._renderDiffLine(line, lineIdx, lineDetails));
            var lineComment = this._renderDiffLineComment(lineIdx, commentConfigs);
            if (!Ext.isEmpty(lineComment)) {
                tableBody.push(lineComment);
            }
        }, this);
        tableBody.push('</tbody></table>');
        return [tableBody.join("\n"), commentConfigs];
    },
    
    _renderDiffLine: function (line, lineIdx, lineDetails) {
        var row = [Ext.String.format('<tr class="{0} line-code line-idx-{1}">', lineDetails.lineCls, lineIdx)];
        row.push(Ext.String.format('<th>{0}</th>', lineDetails.oldLineSymbol));
        row.push(Ext.String.format('<th>{0}</th>', lineDetails.newLineSymbol));
        row.push(Ext.String.format('<td><pre class="prettyprint">{0}</pre></td>',
            Ext.htmlEncode(line)));
        row.push('</tr>');
        return row.join('');
    },
    
    _renderDiffLineComment: function(lineIdx, commentConfigs) {
        var comments = this.commentLocator.getComments(
            this.record.get('filename'), lineIdx);
        
        if (!comments) {
            return null;
        }
        
        var commentRows = [];
        Ext.each(comments, function(comment, idx) {
            var commentId = this.record.get('filename') + '-' + lineIdx + '-' + idx,
                row = [Ext.String.format('<tr class="line-comment" >')];
            row.push('<th colspan="2">comment</th>');
            row.push(Ext.String.format('<td><div id="{0}" class="changeset-comment"></div></td>', commentId));
            row.push('</tr>');
            commentRows.push(row.join(''));
            
            commentConfigs.push({
                renderTo: commentId,
                record: comment,
                messageField: 'comment',
                userField: 'user',
                userNameField: 'login',
                revisionField: 'filename'
            });
        }, this);
        return commentRows.join('\n');
    },

    _getLineDetails: function(line, lineDetails) {
        var diffMatch = this.unifiedDiffRegex.exec(line);
        if (diffMatch) {
            lineDetails = {
                oldLineNumber: parseInt(diffMatch[1], 10),
                newLineNumber: parseInt(diffMatch[3], 10),
                oldLineSymbol: 'old',
                newLineSymbol: 'new',
                lineCls: 'line-diff'
            };
        } else {
            var lineType = this._getLineType(line);
            if (lineType === '+') {
                this._getChangeDetail(lineDetails, false, true);
            } else if (lineType === '-') {
                this._getChangeDetail(lineDetails, true, false);
            } else {
                this._getChangeDetail(lineDetails, true, true);
            }
        }

        return lineDetails;
    },

    _getChangeDetail: function(lineDetails, incrementOld, incrementNew) {
        lineDetails.lineCls = 'line-equal';

        if (incrementOld) {
            lineDetails.oldLineSymbol = lineDetails.oldLineNumber.toString();
            lineDetails.oldLineNumber++;
        } else {
            lineDetails.oldLineSymbol = '+';
            lineDetails.lineCls = 'line-add';
        }

        if (incrementNew) {
            lineDetails.newLineSymbol = lineDetails.newLineNumber.toString();
            lineDetails.newLineNumber++;
        } else {
            lineDetails.newLineSymbol = '-';
            lineDetails.lineCls = 'line-remove';
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