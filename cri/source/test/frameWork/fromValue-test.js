QUnit.test("formValue",function(assert){
    var $form = $("#form");
    var yesterday = new Date();
    yesterday.setTime(yesterday.getTime()-24*3600*1000);

    $form.find("select").selectBox({
        value:2
    });

    $form.find("[name=timeInput]").timeInput();
    $form.find("input").input();

    $form.formValue({
        input:'change it',
        timeInput:yesterday,
        selectBox:3
    });

    var formValue = $form.formValue();
    assert.equal(formValue.input,'change it');
    assert.ok(formValue.timeInput instanceof Date);
    assert.equal(formValue.timeInput,yesterday);
    assert.equal(formValue.selectBox,'3');
});
