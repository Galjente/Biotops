$(function() {
	var jCategoryList = $('#category-list');
	var jCategoryModal = $('#category-modal');
	var jSelectImageButton = $('#select-image-button');
	var jDeleteImageButton = $('#delete-image-button');
	var jImageSelector = $.defaultImageSelector({
        imageSubmitUrl:		'/admin/storage/image/save',
        imageListAjaxUrl:	'/admin/storage/image/list/{{:page}}'
	});

    var jPublishCategory = $('#publish-category');
    var jIconId = jCategoryModal.find('[name="iconId"]');
    var jIconImg = jIconId.siblings('.icon');

    jSelectImageButton.click(function () {
		jImageSelector.selectOne(function(id, uri) {
            jIconId.val(id);
            jIconImg.attr('src', uri);
		});
    });

    jDeleteImageButton.click(function () {
        jIconId.val('');
        jIconImg.attr('src', jIconImg.data('default-src'));
    });

	jCategoryList.tableList({
		dataTemplateSelector:   '#category-template',
		ajaxUrl:                '/admin/place/category/list/{{:page}}'
	});

	jCategoryModal.modalForm({
		loadFormUrl:    '/admin/place/category/{{:id}}',
        onFormLoaded:	function(jModal, data) {
            jModal.title('Edit ' + data.name);

			if (data.icon && data.icon.uri) {
				jIconId.val(data.icon.id);
                jIconImg.attr('src', data.icon.uri);
			} else {
				jIconImg.attr('src', jIconImg.data('default-src'));
			}

		},
        onModalHidden:	function(jModal) {
            jModal.find('img[data-default-src]').each(function(index, item) {
                var jElement = $(item);
                jElement.attr('src', jElement.data('default-src'));
            });
        },
		onSuccess:      function(jModal, data) {
			jCategoryList.refresh();
			jModal.modal('hide');
		}
	});

    jCategoryList.deleteConfirm({
        clickTarget:    '.delete',
        ajaxUrl:        '/admin/place/category/{{:id}}',
        onSuccess:		function(data) {
            jCategoryList.refresh();
        }
    });

    jPublishCategory.bootstrapSwitch();
    jPublishCategory.on('switchChange.bootstrapSwitch', function(event, state) {
        if (state && jIconId.val() === '') {
            jPublishCategory.bootstrapSwitch('state', false, true);
            jCategoryModal.message().showMessage("Category can't be published without icon");
        }
    });
});