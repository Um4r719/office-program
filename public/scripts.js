$(document).ready(function () {
    $('#uploadButton').click(function () {
        const fileInput = $('#excelFile')[0].files[0];
        if (!fileInput) {
            alert('Please select an Excel file.');
            return;
        }

        const formData = new FormData();
        formData.append('excel', fileInput);

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    const sheets = response.sheets;
                    if (sheets.length > 1) {
                        $('#sheetSelector').show();
                        $('#sheetSelect').empty();
                        sheets.forEach((sheet, index) => {
                            $('#sheetSelect').append(`<option value="${index}">${sheet.sheetName}</option>`);
                        });
                    } else {
                        $('#sheetSelector').hide();
                    }
                    displayData(sheets[0].data);
                } else {
                    alert(response.message || 'Failed to process the file.');
                }
            },
            error: function (err) {
                console.error('Error:', err);
                alert('Error uploading the file.');
            }
        });
    });

    $('#sheetSelect').change(function () {
        const selectedSheetIndex = $(this).val();
        $.ajax({
            url: '/upload',
            type: 'GET',
            success: function (response) {
                displayData(response.sheets[selectedSheetIndex].data);
            },
        });
    });

    function displayData(data) {
        $('#tableHeaders').empty();
        $('#tableBody').empty();

        if (!data || data.length === 0) {
            alert('No data to display.');
            return;
        }

        const headers = Object.keys(data[0]);
        headers.forEach(header => $('#tableHeaders').append(`<th>${header}</th>`));
        data.forEach(row => {
            const rowHtml = headers.map(header => `<td>${row[header] || ''}</td>`).join('');
            $('#tableBody').append(`<tr>${rowHtml}</tr>`);
        });

        if ($.fn.DataTable.isDataTable('#dataTable')) {
            $('#dataTable').DataTable().destroy();
        }
        $('#dataTable').DataTable();
    }
});
