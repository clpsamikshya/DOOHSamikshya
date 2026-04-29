using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DoohSamikshya.DataAccess
{
    public class DataAccessService : IDataAccessService
    {
        private readonly IConfiguration _configuration;
        public DataAccessService(IConfiguration configuration)
        {
            _configuration = configuration;

        }

        public async Task<IDbConnection> GetConnection()
        {
            try
            {
                var ConnectionString = _configuration.GetConnectionString("DefaultConnection");
                SqlConnection conn = new(ConnectionString);
               await conn.OpenAsync();
                return conn;
            }
            catch (Exception)
            {
                throw;
            }
        }

        //public async Task<string> RetrievalProcedure(string storedProcedure, string json)
        //{
        //    try
        //    {
        //        using IDbConnection conn = await GetConnection();
        //        DynamicParameters param = new();
        //        param.Add("Json", json, DbType.String);
        //        string result = await conn.QueryFirstOrDefaultAsync<string>(
        //            storedProcedure,
        //            param,
        //            commandType: CommandType.StoredProcedure
        //            ) ?? "{}";
        //        return result;
        //    }
        //    catch (Exception )
        //    { 
        //        throw;
        //    }
        //}
        public async Task<string> RetrievalProcedure(string storedProcedure, string json)
        {
            try
            {
                using IDbConnection conn = await GetConnection();
                DynamicParameters param = new();
                param.Add("JSON", json, DbType.String, ParameterDirection.InputOutput, int.MaxValue); 

                await conn.ExecuteAsync(
                    storedProcedure,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                return param.Get<string>("JSON") ?? "[]"; 
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<string> ActionProcedure(string storedProcedure, string json)
        {
            try
            {
                using IDbConnection conn = await GetConnection();
                DynamicParameters param = new();
                param.Add("Json", json, DbType.String, direction: ParameterDirection.InputOutput,
                    size: int.MaxValue);
                await conn.ExecuteAsync(storedProcedure, param, commandType: CommandType.StoredProcedure);
                return param.Get<string>("Json") ?? "{}";
            }
            catch (Exception)
            {
                throw;
            }
        }

        public void Dispose()
        {
           
        }
    }
}

