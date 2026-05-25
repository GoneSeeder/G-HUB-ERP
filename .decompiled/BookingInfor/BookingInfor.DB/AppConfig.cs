using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using DevExpress.XtraEditors;

namespace BookingInfor.DB;

public class AppConfig
{
	private static bool _CreateBonusList;

	private static string _formateCodeGentBonusCode;

	private static string _bonusShopValue;

	private static string _bonusGuideValue;

	public static bool AllowCreateBonusList => _CreateBonusList;

	public static string FormatCodeGenBonusCode => _formateCodeGentBonusCode;

	public static string BonusShopValue => _bonusShopValue;

	public static string BonusGuideValue => _bonusGuideValue;

	public static void SetDefaultValue()
	{
		_CreateBonusList = false;
		_formateCodeGentBonusCode = "";
		_bonusShopValue = "";
		_bonusGuideValue = "NO";
	}

	public static bool InitialAppConfig(string connectionString, string category)
	{
		SetDefaultValue();
		DataTable dataTable = new DataTable();
		string stringQuery = "SELECT * FROM sysobjects WHERE name='App_Config' ";
		dataTable = DAL.ExecuteQueryReturnDataTable(stringQuery);
		if (dataTable.Rows.Count <= 0)
		{
			XtraMessageBox.Show("ไม\u0e48พบตาราง App_Config โปรดแจ\u0e49งฝ\u0e48าย MIS");
			return false;
		}
		stringQuery = "SELECT * FROM App_Config WHERE Category = @Category";
		List<SqlParameter> list = new List<SqlParameter>();
		list.Add(new SqlParameter("@Category", category));
		dataTable = DAL.ExecuteQueryReturnDataTable(connectionString, stringQuery, list);
		if (dataTable.Rows.Count > 0)
		{
			for (int i = 0; i < dataTable.Rows.Count; i++)
			{
				string text = dataTable.Rows[i]["Name"].ToString();
				string text2 = dataTable.Rows[i]["Value"].ToString();
				switch (text)
				{
				case "BOOKING_CREATE_BONUS_LIST":
					_CreateBonusList = text2 == "Y";
					break;
				case "BOOKING_FORMATECODE_GEN_BONUS":
					_formateCodeGentBonusCode = text2;
					break;
				case "BOOKING_BONUS_SHOP":
					_bonusShopValue = text2;
					break;
				case "BOOKING_BONUS_GUIDE":
					_bonusGuideValue = text2;
					break;
				}
			}
		}
		return true;
	}
}
