const {tbcliente} = require('../../app/models');

module.exports = (sequelize, DataTypes) =>{
    const tbcontasreceber = sequelize.define('tbcontasreceber', {
        cod_cliente: {type: DataTypes.INTEGER, primaryKey: true},
        sequencia: {type: DataTypes.INTEGER, primaryKey: true},
        documento: {type: DataTypes.STRING(20), primaryKey: true},
        tipo: {type: DataTypes.STRING(2), primaryKey: true},
        dt_vencimento: {type: DataTypes.DATE},
        valor: {type: DataTypes.DECIMAL(15, 2)}
      }, {
        freezeTableName: true,
        schema: 'public',
        timestamps: false
    });
    tbcontasreceber.associate = function(models){
      models.tbcontasreceber.belongsTo(models.tbcliente, {foreignKey: 'cod_cliente'}, );
      
      
    }
    return tbcontasreceber;  
}