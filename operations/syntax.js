const { TRANSACTION_SYNTAX } = require('../config');

const SyntaxModel = TRANSACTION_SYNTAX;

class Syntax {
    constructor(data,type) {
        this.type = type;
        this.data = data;
    }

    checkSyntax(data,type){
        var syntax = true;
        Object.keys(SyntaxModel).forEach(function(element,key) {
            console.log(SyntaxModel[element]['type'],type)
            if(SyntaxModel[element]['type'] == type){
                Object.keys(data).forEach(function(element,key) {
                    var i = 0;
                    if(data[element] != SyntaxModel[type]['structure'][i]){
                        return false;
                    }
                    i++;
                });
            }
        });
        return syntax;
    }
}

module.exports = Syntax;