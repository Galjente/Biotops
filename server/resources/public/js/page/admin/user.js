$(function () {
    var jUserList = $('#user-list');
    var jUserModal = $('#user-modal');

    jUserList.tableList({
        dataTemplateSelector:   '#user-template',
        ajaxUrl:                '/admin/user/list/{{:page}}'
    });

    jUserModal.modalForm({
        loadFormUrl:    '/admin/user/{{:id}}',
        onSuccess:      function(jModal, data) {
            jUserList.refresh();
            jModal.modal('hide');
        },
        onFormLoaded:	function(jModal, data){
            jModal.title('Edit ' + data.name + ' ' + data.surname);
        }
    });

	jUserList.deleteConfirm({
        clickTarget:    '.delete',
        ajaxUrl:        '/admin/user/{{:id}}',
        onSuccess:		function(data) {
            jUserList.refresh();
        }
    });
});