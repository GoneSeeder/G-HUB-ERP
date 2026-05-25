using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Windows.Forms;

namespace BookingInfor;

public static class DAL
{
	public static string StringConnection = "";

	public static int CommTimeout = 180;

	public static DataTable ExecuteQueryReturnDataTable(string stringQuery)
	{
		return QueryReturnDataTable(StringConnection, stringQuery, CommandType.Text, null);
	}

	public static DataTable ExecuteQueryReturnDataTable(string stringConnection, string stringQuery)
	{
		return QueryReturnDataTable(stringConnection, stringQuery, CommandType.Text, null);
	}

	public static DataTable ExecuteQueryReturnDataTable(string stringConnection, string stringQuery, List<SqlParameter> parameters)
	{
		return QueryReturnDataTable(stringConnection, stringQuery, CommandType.Text, parameters);
	}

	private static DataTable QueryReturnDataTable(string stringConnection, string stringQuery, CommandType cmdType, List<SqlParameter> parameters)
	{
		DataTable dataTable = new DataTable();
		using (SqlConnection connection = new SqlConnection(stringConnection))
		{
			using SqlCommand sqlCommand = new SqlCommand(stringQuery, connection);
			sqlCommand.CommandTimeout = CommTimeout;
			sqlCommand.CommandType = cmdType;
			if (parameters != null)
			{
				foreach (SqlParameter parameter in parameters)
				{
					sqlCommand.Parameters.Add(parameter);
				}
			}
			try
			{
				using SqlDataAdapter sqlDataAdapter = new SqlDataAdapter(sqlCommand);
				sqlDataAdapter.AcceptChangesDuringFill = true;
				sqlDataAdapter.Fill(dataTable);
			}
			catch (SqlException ex)
			{
				MessageBox.Show("Error : " + ex.Message + "\n" + stringQuery);
			}
			catch (Exception ex2)
			{
				MessageBox.Show("Error : " + ex2.Message);
			}
			finally
			{
				if (parameters != null)
				{
					sqlCommand.Parameters.Clear();
				}
			}
		}
		return dataTable;
	}

	private static void WriteError(string error)
	{
		Console.WriteLine("Error : " + error);
	}

	public static string zNumberM(string rFieldName, DateTime rDate, int rFlag, string rSQLconnect)
	{
		string text = "";
		int num = 0;
		int num2 = 0;
		int num3 = 0;
		num3 = rDate.Year;
		num2 = rDate.Month;
		while (true)
		{
			text = "Select number from zNumber Where FieldName='" + rFieldName + "' and Year=" + Convert.ToString(num3) + " and Month=" + Convert.ToString(num2);
			DataTable dataTable = new DataTable();
			using SqlConnection sqlConnection = new SqlConnection(rSQLconnect);
			if (sqlConnection.State == ConnectionState.Open)
			{
				sqlConnection.Close();
			}
			sqlConnection.Open();
			SqlCommand sqlCommand = new SqlCommand(text, sqlConnection);
			SqlDataReader sqlDataReader = sqlCommand.ExecuteReader();
			sqlDataReader.Read();
			if (sqlDataReader.HasRows)
			{
				num = Convert.ToInt16(sqlDataReader.GetValue(0).ToString());
				num++;
				if (Convert.ToInt16(rFlag) == 2)
				{
					text = "update zNumber set number=number+1 Where FieldName='" + rFieldName + "' and Year=" + Convert.ToString(num3) + " and Month=" + Convert.ToString(num2);
					ExecuteQueryReturnDataTable(rSQLconnect, text);
				}
				sqlDataReader.Close();
				text = ((num2 <= 9) ? ("0" + Convert.ToString(num2) + num.ToString("0000")) : (Convert.ToString(num2) + num.ToString("0000")));
				if (Convert.ToInt16(rFlag) != 2)
				{
					text += " {New}";
				}
				text = Util.Right(Convert.ToString(num3), 1) + text;
				return rFieldName.ToUpper() + text;
			}
			text = "Insert into zNumber (FieldName,year,month,number) values  ('" + rFieldName + "','" + num3 + "','" + num2 + "',0 ) ";
			ExecuteQueryReturnDataTable(rSQLconnect, text);
			sqlDataReader.Close();
		}
	}
}
