/**
 * @time {时间}
 * @author {编写者}
 * @info 修改密码
 */

'use strict';

function UpdatePwdModel() {
}

UpdatePwdModel.prototype.save = function (data, okFn, errFn) {
    $.ajax('http://i.yinyuetai.com/i/profile/update-password',{
        method: 'GET',
        data: data,
        success: function(res){
            okFn && okFn(res);
        },
        error: function(err){
            errFn && errFn(err);
        }
    });

};

module.exports = UpdatePwdModel;