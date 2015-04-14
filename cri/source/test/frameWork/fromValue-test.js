QUnit.test("formValue",function(assert){
    var $form = $("#form");

    $form.find("select").selectBox({
        value:2
    });

    $form.find("[name=timeInput]").timeInput({
        value:'2015/04/12'
    });
    $form.find("input").input();

    $form.formValue({
        input:'change it',
        selectBox:3
    });

    var formValue = $form.formValue();
    assert.equal(formValue.input,'change it');
    assert.equal(formValue.timeInput,'2015/04/12');
    assert.equal(formValue.selectBox,'3');
    $form.formReset();
});
