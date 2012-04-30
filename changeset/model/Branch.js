Ext.define('changeset.model.Branch', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'commit', type: 'object'},
        {name: 'name', type: 'string'}
    ]
});