$(function() {
    $('[data-toggle="tooltip"]').tooltip();

    $('#image-preview-modal').on('show.bs.modal', function (event) {
        var jElement = $(event.relatedTarget);
        var imageUri = jElement.data('uri');
        var jModal = $(this);
        jModal.find('img').attr('src', imageUri);
    }).on('hidden.bs.modal', function (event) {
        var jModal = $(this);
        jModal.find('img').attr('src', '');
    });

    var jGridList = $('#image-grid-list').imageGridList({
        dataTemplateSelector:	'#image-list-template',
        ajaxUrl:				'/admin/storage/image/list/{{:page}}'
    });

    jGridList.deleteConfirm({
        clickTarget:    '.delete',
        ajaxUrl:        '/admin/storage/image/{{:id}}',
        onSuccess:		function(data){
            $('#image-' + data.id).remove();
        }
    });

    $('#image-upload-modal').imageUploadModal({
        onSuccess:		function(jImageUploadModal, data) {
            jGridList.appendImage(data);
            jImageUploadModal.modal('hide');
        }
    });
});