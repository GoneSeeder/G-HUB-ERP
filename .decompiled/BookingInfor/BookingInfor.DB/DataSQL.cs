using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading;
using DevExpress.XtraEditors;

namespace BookingInfor.DB;

public class DataSQL
{
	public static void GetServerDate()
	{
		DateTime serverDate = Convert.ToDateTime(DAL.ExecuteQueryReturnDataTable("SELECT CONVERT(date, GETDATE()) As ServerDate").Rows[0]["ServerDate"]);
		ParaClass.ServerDate = serverDate;
	}

	public static string GetUserName(string userLogin)
	{
		string result = "";
		string stringQuery = "SELECT Code,Name FROM User1 WHERE Code=@userLogin ";
		List<SqlParameter> list = new List<SqlParameter>();
		list.Add(new SqlParameter("@userLogin", userLogin));
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery, list);
		if (dataTable.Rows.Count > 0)
		{
			result = dataTable.Rows[0]["Name"].ToString();
		}
		return result;
	}

	public static string GetServerTime()
	{
		string stringQuery = "\r\n                SELECT LEFT(CONVERT(VARCHAR,getdate(),108),5) as ServerTime\r\n                ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		return dataTable.Rows[0]["ServerTime"].ToString();
	}

	public static DataTable GetDataBooking(AppPrivilege.statusActive statusActive, AppPrivilege.filterDate filterDate)
	{
		string text = "";
		text = statusActive switch
		{
			AppPrivilege.statusActive.Complete => "and Complete='Y'", 
			AppPrivilege.statusActive.Incomplete => "and Complete='N'", 
			_ => "", 
		};
		string text2 = "";
		text2 = filterDate switch
		{
			AppPrivilege.filterDate.ThreeMonth => "and DocDate >= DATEADD(month,-3,GETDATE())", 
			AppPrivilege.filterDate.SixMonth => "and DocDate >= DATEADD(month,-6,GETDATE())", 
			AppPrivilege.filterDate.OneYear => "and DocDate >= DATEADD(month,-12,GETDATE())", 
			_ => "", 
		};
		string text3 = "";
		if (AppConfig.AllowCreateBonusList)
		{
			text3 = ",Upload";
		}
		string stringQuery = "\r\n                SELECT [DocDate]\r\n                    ,[DocNo]\r\n                    ,[DocTime]\r\n                    ,[AgentCode]\r\n                    ,[AgentName]\r\n                    ,[GuideCode]\r\n                    ,[GuideName]\r\n                    ,[TelGuide]\r\n                    ,[PartyCode]\r\n                    ,[Pax]\r\n                    ,[CarCode]\r\n                    ,[Remark]\r\n                    ,[DateBookJW]\r\n                    ,[TimeBookJW]\r\n                    ,[DateBookBKF]\r\n                    ,[TimeBookBKF]\r\n                    ,[DateBookRTH]\r\n                    ,[TimeBookRTH]\r\n                    ,[DateBookTRP]\r\n                    ,[TimeBookTRP]\r\n                    ,[CreateDate]\r\n                    ,[CreateBy]\r\n                    ,[ModifyDate]\r\n                    ,[ModifyBy]\r\n                    ,[ArriveDate]\r\n                    ,[DepartureDate]\r\n                    ,[NationCode]\r\n                    ,[FirstShop]\r\n                    ,[PTYDateStart]\r\n                    ,[PTYDateEnd]\r\n                    ,[OrderDate_Ref]\r\n                    ,[FaxNo_Ref]\r\n                    ,[AgentCode_Ref]\r\n                    ,[PartyCode_Ref]\r\n                    ,[Import_SeriesNo]\r\n                    ,[ImportType]\r\n                    ,[Remark_Book]\r\n                    ,[Complete]\r\n                    ,[Tel_Driver]\r\n                    " + text3 + "\r\n                FROM [BookingInfor]\r\n                WHERE 1=1\r\n                    " + text + "\r\n                    " + text2 + "\r\n                ORDER BY \r\n                    [DocDate] DESC\r\n                    ,[DocTime] DESC\r\n                    ,[DocNo] DESC\r\n           \r\n                ";
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static DataTable GetBookingDetail(string docNo)
	{
		string text = "";
		if (AppConfig.AllowCreateBonusList)
		{
			text = ",Bonus_Ref";
		}
		string stringQuery = "\r\n                SELECT \r\n                    [DocDate]\r\n                    ,[DocNo]\r\n                    ,[DocTime]\r\n                    ,[AgentCode]\r\n                    ,[AgentName]\r\n                    ,[GuideCode]\r\n                    ,[GuideName]\r\n                    ,[TelGuide]\r\n                    ,[PartyCode]\r\n                    ,[Pax]\r\n                    ,[CarCode]\r\n                    ,[Remark]\r\n                    ,[DateBookJW]\r\n                    ,[TimeBookJW]\r\n                    ,[DateBookBKF]\r\n                    ,[TimeBookBKF]\r\n                    ,[DateBookRTH]\r\n                    ,[TimeBookRTH]\r\n                    ,[DateBookTRP]\r\n                    ,[TimeBookTRP]\r\n                    ,[CreateDate]\r\n                    ,[CreateBy]\r\n                    ,[ModifyDate]\r\n                    ,[ModifyBy]\r\n                    ,[ArriveDate]\r\n                    ,[DepartureDate]\r\n                    ,[NationCode]\r\n                    ,[FirstShop]\r\n                    ,[PTYDateStart]\r\n                    ,[PTYDateEnd]\r\n                    ,[OrderDate_Ref]\r\n                    ,[FaxNo_Ref]\r\n                    ,[AgentCode_Ref]\r\n                    ,[PartyCode_Ref]\r\n                    ,[Import_SeriesNo]\r\n                    ,[ImportType]\r\n                    ,[Remark_Book]\r\n                    ,[Complete]\r\n                    ,[Tel_Driver]\r\n                    " + text + "\r\n                FROM [BookingInfor]\r\n                WHERE [DocNo]='" + docNo + "'\r\n                    ";
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static DataTable GetFaxOrderPlace(string docNo)
	{
		string stringQuery = "\r\n                    SELECT \r\n\t                    bf.[Order_Date]\r\n\t                    ,bf.[Fax_No]\r\n\t                    ,bf.[Agent_Code]\r\n\t                    ,bf.[Code]\r\n\t                    ,bf.[Place_Code]\r\n\t                    ,bf.[Start_Date]\r\n\t                    ,bf.[End_Date]\r\n                    FROM [dbo].[BookingInfor_FaxOrderPlace] bf\r\n\t                    INNER JOIN BookingInfor bk ON bf.Order_Date=bk.OrderDate_Ref and bf.Fax_No=bk.FaxNo_Ref and bf.Agent_Code=bk.AgentCode_Ref and bf.Code=bk.PartyCode_Ref\r\n                    WHERE \r\n\t                    bk.DocNo='" + docNo + "'\r\n\r\n                    ";
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static string GenerateDocNo()
	{
		Thread.Sleep(100);
		string stringQuery = "\r\n                SELECT REPLACE(CONVERT(VARCHAR(8), GetDate(), 112) + CONVERT(VARCHAR(15), GetDate(), 114), ':','') As GenDocNo\r\n                ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		return dataTable.Rows[0]["GenDocNo"].ToString();
	}

	public static bool IsDuplicateDocNo(string docNo)
	{
		bool result = false;
		string stringQuery = "SELECT DocNo FROM BookingInfor WHERE DocNo='" + docNo + "'";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			result = true;
		}
		return result;
	}

	public static void SaveBookingData(bool isEdit, bookArg argBook)
	{
		string sQLDateTime = Util.GetSQLDateTime(argBook.docDate);
		string text = "NULL";
		if (argBook.dateBookJW.HasValue)
		{
			text = "'" + Util.GetSQLDateTime(argBook.dateBookJW.Value) + "'";
		}
		string text2 = "NULL";
		if (argBook.dateBookBKF.HasValue)
		{
			text2 = "'" + Util.GetSQLDateTime(argBook.dateBookBKF.Value) + "'";
		}
		string text3 = "NULL";
		if (argBook.dateBookRTH.HasValue)
		{
			text3 = "'" + Util.GetSQLDateTime(argBook.dateBookRTH.Value) + "'";
		}
		string text4 = "NULL";
		if (argBook.dateBookTRP.HasValue)
		{
			text4 = "'" + Util.GetSQLDateTime(argBook.dateBookTRP.Value) + "'";
		}
		string text5 = "NULL";
		if (argBook.arriveDate.HasValue)
		{
			text5 = "'" + Util.GetSQLDateTime(argBook.arriveDate.Value) + "'";
		}
		string text6 = "NULL";
		if (argBook.departureDate.HasValue)
		{
			text6 = "'" + Util.GetSQLDateTime(argBook.departureDate.Value) + "'";
		}
		string text7 = "NULL";
		if (argBook.ptyDateStart.HasValue)
		{
			text7 = "'" + Util.GetSQLDateTime(argBook.ptyDateStart.Value) + "'";
		}
		string text8 = "NULL";
		if (argBook.ptyDateEnd.HasValue)
		{
			text8 = "'" + Util.GetSQLDateTime(argBook.ptyDateEnd.Value) + "'";
		}
		string text9 = "NULL";
		if (argBook.orderDate.HasValue)
		{
			text9 = "'" + Util.GetSQLDateTime(argBook.orderDate.Value) + "'";
		}
		if (!isEdit)
		{
			string stringQuery = "\r\n\r\n                    INSERT INTO [dbo].[BookingInfor]\r\n                        (\r\n                        [DocDate]\r\n                        ,[DocNo]\r\n                        ,[DocTime]\r\n                        ,[AgentCode]\r\n                        ,[AgentName]\r\n                        ,[GuideCode]\r\n                        ,[GuideName]\r\n                        ,[TelGuide]\r\n                        ,[PartyCode]\r\n                        ,[Pax]\r\n                        ,[CarCode]\r\n                        ,[Remark]\r\n                        ,[DateBookJW]\r\n                        ,[TimeBookJW]\r\n                        ,[DateBookBKF]\r\n                        ,[TimeBookBKF]\r\n                        ,[DateBookRTH]\r\n                        ,[TimeBookRTH]\r\n                        ,[DateBookTRP]\r\n                        ,[TimeBookTRP]\r\n                        ,[CreateDate]\r\n                        ,[CreateBy]\r\n                        ,[ModifyDate]\r\n                        ,[ModifyBy]\r\n                        ,[ArriveDate]\r\n                        ,[DepartureDate]\r\n                        ,[NationCode]\r\n                        ,[FirstShop]\r\n                        ,[PTYDateStart]\r\n                        ,[PTYDateEnd]\r\n                        ,[Complete]\r\n                        ,[OrderDate_Ref]\r\n                        ,[FaxNo_Ref]\r\n                        ,[AgentCode_Ref]\r\n                        ,[PartyCode_Ref]\r\n                        ,[Remark_Book]\r\n                        ,[Import_SeriesNo]\r\n                        ,[ImportType]\r\n                        ,[Tel_Driver]\r\n                        )\r\n                    VALUES\r\n                        (\r\n\t                    '" + sQLDateTime + "'\r\n                        ,'" + argBook.docNo + "'\r\n                        ,'" + argBook.docTime + "'\r\n                        ,'" + argBook.agentCode + "'\r\n                        ,'" + argBook.agentName + "'\r\n                        ,'" + argBook.guideCode + "'\r\n                        ,'" + argBook.guideName + "'\r\n                        ,'" + argBook.telGuide + "'\r\n                        ,'" + argBook.partyCode + "'\r\n                        ," + argBook.pax + "\r\n                        ,'" + argBook.carCode + "'\r\n                        ,'" + argBook.remark + "'\r\n                        ," + text + "\r\n                        ,'" + argBook.timeBookJW + "'\r\n                        ," + text2 + "\r\n                        ,'" + argBook.timeBookBKF + "'\r\n                        ," + text3 + "\r\n                        ,'" + argBook.timeBookRTH + "'\r\n                        ," + text4 + "\r\n                        ,'" + argBook.timeBookTRP + "'\r\n                        ,Getdate()\r\n                        ,'" + ParaClass.UserLogin + "'\r\n                        ,Getdate()\r\n                        ,'" + ParaClass.UserLogin + "'\r\n                        ," + text5 + "\r\n                        ," + text6 + "\r\n                        ,'" + argBook.nationCode + "'\r\n                        ,'" + argBook.firstShop + "'\r\n                        ," + text7 + "\r\n                        ," + text8 + "\r\n                        ,'" + argBook.complete + "'\r\n                        ," + text9 + "\r\n                        ,'" + argBook.faxNo + "'\r\n                        ,'" + argBook.agentCodeRef + "'\r\n                        ,'" + argBook.partyCodeRef + "'\r\n                        ,'" + argBook.remarkBook + "'\r\n                        ," + argBook.seriesNo + "\r\n                        ,'" + argBook.importType + "'\r\n                        ,'" + argBook.telDriver + "'\r\n\t                    )\r\n\r\n                        ";
			DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		}
		else
		{
			string stringQuery2 = "\r\n\r\n                    UPDATE [dbo].[BookingInfor]\r\n                    SET \r\n\t                    [AgentCode] = '" + argBook.agentCode + "'\r\n\t                    ,[AgentName] = '" + argBook.agentName + "'\r\n\t                    ,[GuideCode] = '" + argBook.guideCode + "'\r\n\t                    ,[GuideName] = '" + argBook.guideName + "'\r\n\t                    ,[TelGuide] = '" + argBook.telGuide + "'\r\n\t                    ,[PartyCode] = '" + argBook.partyCode + "'\r\n\t                    ,[Pax] = " + argBook.pax + "\r\n\t                    ,[CarCode] = '" + argBook.carCode + "'\r\n\t                    ,[Remark] = '" + argBook.remark + "'\r\n\t                    ,[DateBookJW] = " + text + "\r\n\t                    ,[TimeBookJW] = '" + argBook.timeBookJW + "'\r\n\t                    ,[DateBookBKF] = " + text2 + "\r\n\t                    ,[TimeBookBKF] = '" + argBook.timeBookBKF + "'\r\n\t                    ,[DateBookRTH] = " + text3 + "\r\n\t                    ,[TimeBookRTH] = '" + argBook.timeBookRTH + "'\r\n\t                    ,[DateBookTRP] = " + text4 + "\r\n\t                    ,[TimeBookTRP] = '" + argBook.timeBookTRP + "'\r\n\t                    ,[ModifyDate] = GetDate()\r\n\t                    ,[ModifyBy] = '" + ParaClass.UserLogin + "'\r\n                        ,[ArriveDate] = " + text5 + "\r\n                        ,[DepartureDate] = " + text6 + "\r\n                        ,[NationCode] = '" + argBook.nationCode + "'\r\n                        ,[FirstShop] = '" + argBook.firstShop + "'\r\n                        ,[PTYDateStart] = " + text7 + "\r\n                        ,[PTYDateEnd] = " + text8 + "\r\n                        ,[Complete] = '" + argBook.complete + "'\r\n                        ----กรณ\u0e35 Update ไม\u0e48ต\u0e49อง Update ของ Import\r\n                        --,[OrderDate_Ref] = " + text9 + "\r\n                        --,[FaxNo_Ref] = '" + argBook.faxNo + "'\r\n                        --,[AgentCode_Ref] = '" + argBook.agentCodeRef + "'                        \r\n                        --,[Remark_Book] = '" + argBook.remarkBook + "'\r\n                        --,[Import_SeriesNo] = " + argBook.seriesNo + "\r\n                        --,[ImportType] = '" + argBook.importType + "'\r\n\r\n                        ,[PartyCode_Ref] = '" + argBook.partyCodeRef + "'\r\n                        ,[Tel_Driver] = '" + argBook.telDriver + "'\r\n                    WHERE \r\n\t                    [DocNo] = '" + argBook.docNo + "'\r\n\r\n                        ";
			DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery2);
		}
	}

	public static bool DeleteBookingData(string docNo)
	{
		bool result = true;
		try
		{
			string stringQuery = "\r\n                        DELETE bf\r\n                        FROM \r\n\t                        BookingInfor_FaxOrderPlace bf\r\n\t                        INNER JOIN BookingInfor bk ON bf.Order_Date=bk.OrderDate_Ref and bf.Fax_No=bk.FaxNo_Ref and bf.Agent_Code=bk.AgentCode_Ref and bf.Code=bk.PartyCode_Ref\r\n                        WHERE \r\n\t                        bk.DocNo='" + docNo + "'\r\n                        ";
			DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
			string stringQuery2 = "DELETE BookingInfor WHERE DocNo='" + docNo + "' ";
			DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery2);
		}
		catch (Exception ex)
		{
			XtraMessageBox.Show("Error : " + ex.Message);
			result = false;
		}
		return result;
	}

	public static int GetMaxSeriesNo()
	{
		int result = 0;
		string stringQuery = "SELECT MAX(Import_SeriesNo) as MaxSeriesNo FROM BookingInfor";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows[0]["MaxSeriesNo"] != DBNull.Value)
		{
			result = Convert.ToInt16(dataTable.Rows[0]["MaxSeriesNo"]);
		}
		return result;
	}

	public static DataTable GetSeriesNo()
	{
		string stringQuery = "SELECT DISTINCT Import_SeriesNo FROM BookingInfor WHERE Import_SeriesNo<>0 ORDER BY Import_SeriesNo DESC";
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static bool IsDuplicateDataImport(string partycodeRef)
	{
		bool result = false;
		string stringQuery = "SELECT *  FROM BookingInfor WHERE PartyCode_Ref='" + partycodeRef + "' ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			result = true;
		}
		return result;
	}

	public static void InsertFaxOrderPlace(BookFaxOrderPlaceArg argDetail)
	{
		string sQLDateTime = Util.GetSQLDateTime(argDetail.orderDate.Value);
		string text = "NULL";
		if (argDetail.startDate.HasValue)
		{
			text = "'" + Util.GetSQLDateTime(argDetail.startDate.Value) + "'";
		}
		string text2 = "NULL";
		if (argDetail.endDate.HasValue)
		{
			text2 = "'" + Util.GetSQLDateTime(argDetail.endDate.Value) + "'";
		}
		string stringQuery = "\r\n                    INSERT INTO [dbo].[BookingInfor_FaxOrderPlace]\r\n\t                    (\r\n\t                    [Order_Date]\r\n\t                    ,[Fax_No]\r\n\t                    ,[Agent_Code]\r\n\t                    ,[Code]\r\n\t                    ,[Place_Code]\r\n\t                    ,[Start_Date]\r\n\t                    ,[End_Date]\r\n\t                    ,[Import_SeriesNo]\r\n\t                    )\r\n                    VALUES\r\n\t                    (\r\n\t                    '" + sQLDateTime + "'\r\n\t                    ,'" + argDetail.faxNo + "'\r\n\t                    ,'" + argDetail.agentCode + "'\r\n\t                    ,'" + argDetail.partyCode + "'\r\n\t                    ,'" + argDetail.placeCode + "'\r\n\t                    ," + text + "\r\n\t                    ," + text2 + "\r\n\t                    ," + argDetail.seriesNo + "\r\n\t                    )\r\n                        ";
		DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static DataTable GetDataMainFromSeriesNo(int seriesNo)
	{
		string stringQuery = "\r\n                SELECT [DocDate]\r\n                    ,[DocNo]\r\n                    ,[DocTime]\r\n                    ,[AgentCode]\r\n                    ,[AgentName]\r\n                    ,[GuideCode]\r\n                    ,[GuideName]\r\n                    ,[TelGuide]\r\n                    ,[PartyCode]\r\n                    ,[Pax]\r\n                    ,[CarCode]\r\n                    ,[Remark]\r\n                    ,[DateBookJW]\r\n                    ,[TimeBookJW]\r\n                    ,[DateBookBKF]\r\n                    ,[TimeBookBKF]\r\n                    ,[DateBookRTH]\r\n                    ,[TimeBookRTH]\r\n                    ,[DateBookTRP]\r\n                    ,[TimeBookTRP]\r\n                    ,[CreateDate]\r\n                    ,[CreateBy]\r\n                    ,[ModifyDate]\r\n                    ,[ModifyBy]\r\n                    ,[ArriveDate]\r\n                    ,[DepartureDate]\r\n                    ,[NationCode]\r\n                    ,[FirstShop]\r\n                    ,[PTYDateStart]\r\n                    ,[PTYDateEnd]\r\n                    ,[OrderDate_Ref]\r\n                    ,[FaxNo_Ref]\r\n                    ,[AgentCode_Ref]\r\n                    ,[PartyCode_Ref]\r\n                    ,[Import_SeriesNo]\r\n                    ,[ImportType]\r\n                    ,[Remark_Book]\r\n                    ,[Complete]\r\n                FROM [BookingInfor]\r\n                WHERE 1=1\r\n                    and Import_SeriesNo = " + seriesNo + "\r\n           \r\n                ";
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static DataTable GetDataDetailFromSeriesNo(int seriesNo)
	{
		string stringQuery = "\r\n                    SELECT \r\n\t                    [Order_Date]\r\n\t                    ,[Fax_No]\r\n\t                    ,[Agent_Code]\r\n\t                    ,[Code]\r\n\t                    ,[Place_Code]\r\n\t                    ,[Start_Date]\r\n\t                    ,[End_Date]\r\n                    FROM [dbo].[BookingInfor_FaxOrderPlace] \t                    \r\n                    WHERE \r\n\t                    Import_SeriesNo=" + seriesNo + "\r\n                    ";
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static bool DeleteBookingDataFromSeriesNo(int seriesNo)
	{
		bool result = true;
		try
		{
			string stringQuery = "\r\n                        DELETE BookingInfor_FaxOrderPlace\r\n                        WHERE \r\n\t                        Import_SeriesNo=" + seriesNo + "\r\n                        ";
			DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
			string stringQuery2 = "\r\n                        DELETE BookingInfor \r\n                        WHERE Import_SeriesNo=" + seriesNo + " ";
			DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery2);
		}
		catch (Exception ex)
		{
			XtraMessageBox.Show("Error : " + ex.Message);
			result = false;
		}
		return result;
	}

	public static int CountRowDataFromSeriesNo(int seriesNo, string gridType)
	{
		int num = 0;
		string stringQuery = "";
		if (!(gridType == "Main"))
		{
			if (gridType == "Detail")
			{
				stringQuery = "SELECT Count(*) As cntRow FROM BookingInfor_FaxOrderPlace WHERE Import_SeriesNo=" + seriesNo + " ";
			}
		}
		else
		{
			stringQuery = "SELECT Count(*) As cntRow FROM BookingInfor WHERE Import_SeriesNo=" + seriesNo + " ";
		}
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		return (int)dataTable.Rows[0]["cntRow"];
	}

	public static DataTable IsDuplicatePartyCode(string partyCode, string docNo, DateTime docDate)
	{
		string sQLDateTime = Util.GetSQLDateTime(docDate);
		string stringQuery = "\r\n                SELECT *\r\n                FROM\r\n\t                (\r\n\t                SELECT\r\n\t\t                CASE WHEN ArriveDate is null THEN DocDate ELSE ArriveDate END as DateArrive\r\n\t\t                ,*\r\n\t                FROM BookingInfor\r\n\t                ) bi \r\n                WHERE \r\n                    bi.PartyCode='" + partyCode + "' and bi.DocNo<>'" + docNo + "' \r\n\t                and YEAR(bi.DateArrive)=YEAR('" + sQLDateTime + "')\r\n\r\n                        ";
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static bool IsDupPartyCodeRef(string partyCodeRef, DateTime arriveDate)
	{
		bool result = false;
		string sQLDateTime = Util.GetSQLDateTime(arriveDate);
		string stringQuery = "\r\n                SELECT *\r\n                FROM\r\n\t                (\r\n\t                SELECT\r\n\t\t                CASE WHEN ArriveDate is null THEN DocDate ELSE ArriveDate END as DateArrive\r\n\t\t                ,*\r\n\t                FROM BookingInfor\r\n\t                ) bi \r\n                WHERE \r\n                    bi.PartyCode_Ref='" + partyCodeRef + "' and YEAR(bi.DateArrive)=YEAR('" + sQLDateTime + "')\r\n\r\n                        ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			result = true;
		}
		return result;
	}

	public static bool IsHasFaxOrderPlace(DateTime orderDate, short faxNo, string agentCode, string partyCode, string placeCode)
	{
		string sQLDateTime = Util.GetSQLDateTime(orderDate);
		bool result = false;
		string stringQuery = "\r\n                SELECT *  \r\n                FROM BookingInfor_FaxOrderPlace \r\n                WHERE Order_Date='" + sQLDateTime + "'\r\n\t                and Fax_No=" + faxNo + "\r\n\t                and Agent_Code='" + agentCode + "'\r\n\t                and Code='" + partyCode + "'\r\n\t                and Place_Code='" + placeCode + "'\r\n                    ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			result = true;
		}
		return result;
	}

	public static DataTable GetDataBookingMove(AppPrivilege.statusActive statusActive, AppPrivilege.statusMove statusMove, string docNo)
	{
		string text = "";
		text = statusActive switch
		{
			AppPrivilege.statusActive.Complete => " and Complete='Y'", 
			AppPrivilege.statusActive.Incomplete => " and Complete='N'", 
			_ => "", 
		};
		string text2 = "";
		string text3 = "";
		switch (statusMove)
		{
		case AppPrivilege.statusMove.MoveFirst:
			text3 = " ORDER BY DocDate ASC,DocNo ASC";
			break;
		case AppPrivilege.statusMove.MovePrevious:
			text2 = " and DocNo<'" + docNo + "'";
			text3 = " ORDER BY DocDate DESC,DocNo DESC";
			break;
		case AppPrivilege.statusMove.MoveNext:
			text2 = " and DocNo>'" + docNo + "'";
			text3 = " ORDER BY DocDate ASC,DocNo ASC";
			break;
		case AppPrivilege.statusMove.MoveLast:
			text3 = " ORDER BY DocDate DESC,DocNo DESC";
			break;
		}
		string stringQuery = "SELECT TOP 1 DocDate,DocNo FROM BookingInfor Where 1=1 " + text2 + text + text3;
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static DataTable GetDataAgentMatching()
	{
		string stringQuery = "\r\n                SELECT \r\n\t                bi.agentCodeRef as AgentCodeRef\r\n\t                ,ISNULL((SELECT TOP 1 AgentName FROM BookingInfor t1 WHERE bi.agentCodeRef=t1.AgentCode_Ref ORDER BY CreateDate DESC),'') As AgentNameRef\r\n\t                ,ISNULL(ba.AgentCode,'') AS AgentCode\r\n\t                ,ISNULL(ag.Name,'') as AgentName\r\n                FROM \r\n\t                (\r\n\t                SELECT \r\n\t\t                DISTINCT agentCode_ref As agentCodeRef\r\n\t                FROM \r\n\t\t                (\r\n\t\t                SELECT agentCode_ref FROM BookingInfor\r\n\t\t                union all\r\n\t\t                SELECT AgentCodeRef FROM BookingInfor_Agent\r\n\t\t                ) b1\r\n\t                WHERE agentCode_ref != ''\r\n\t                ) bi\r\n\t                LEFT OUTER JOIN BookingInfor_Agent ba ON bi.agentCodeRef=ba.agentCodeRef\r\n\t                LEFT OUTER JOIN Agent ag ON ba.AgentCode=ag.Code\r\n                ORDER BY bi.agentCodeRef\r\n\r\n                ";
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static DataTable GetListAgent()
	{
		string stringQuery = "\r\n                SELECT \r\n                    Code\r\n                    ,Name \r\n                FROM Agent \r\n                ORDER BY Code\r\n                ";
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static string GetAgentName(string agentCode)
	{
		string result = "";
		string stringQuery = "\r\n                SELECT \r\n                    Code\r\n                    ,Name \r\n                FROM Agent \r\n                WHERE Code='" + agentCode + "'\r\n                ORDER BY Code\r\n                ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			result = dataTable.Rows[0]["Name"].ToString();
		}
		return result;
	}

	public static void SaveAgentMatching(string agentCodeRef, string agentCode)
	{
		string stringQuery = "DELETE FROM BookingInfor_Agent WHERE AgentCodeRef='" + agentCodeRef + "'";
		DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (agentCode != "")
		{
			string stringQuery2 = "\r\n                    INSERT INTO BookingInfor_Agent (AgentCodeRef,AgentCode)\r\n                    VALUES ('" + agentCodeRef + "','" + agentCode + "')\r\n                    ";
			DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery2);
		}
	}

	public static void DeleteAgentMatching(string agentCodeRef)
	{
		string stringQuery = "DELETE FROM BookingInfor_Agent WHERE AgentCodeRef='" + agentCodeRef + "'";
		DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static string GetAgentCodeFromAgentCodeRef(string agentCodeRef)
	{
		string result = "";
		string stringQuery = "\r\n                SELECT \r\n                    AgentCodeRef\r\n                    ,AgentCode\r\n                FROM BookingInfor_Agent \r\n                WHERE AgentCodeRef='" + agentCodeRef + "'\r\n                ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			result = dataTable.Rows[0]["AgentCode"].ToString();
		}
		return result;
	}

	public static DataTable GetAgentOnAnotherAgentRef(string agentCode)
	{
		string stringQuery = "\r\n                SELECT \r\n                    AgentCodeRef\r\n                    ,AgentCode                \r\n                FROM \r\n                    BookingInfor_Agent\r\n                WHERE            \r\n                    AgentCode='" + agentCode + "'     \r\n                    ";
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static DataTable GetDataBookingFromBookDateJW(DateTime shopDate)
	{
		string sQLDateTime = Util.GetSQLDateTime(shopDate);
		string text = "";
		string text2 = "";
		if (AppConfig.FormatCodeGenBonusCode == "GEI")
		{
			text = "and bi.NationCode in ('CN','TW')";
			text2 = "\r\n                      Case bi.NationCode \r\n\t\t\t\t\t\tWHEN 'CN' THEN 10 \r\n\t\t\t\t\t\tWHEN 'TW' THEN 20\r\n\t\t\t\t\t\tELSE 999\r\n\t\t\t\t\t  END,\r\n                        ";
		}
		string stringQuery = "\r\n                SELECT \r\n                    " + text2 + "\r\n\t\t\t\t\tCASE \r\n\t\t\t\t\t\t--WHEN bn.Code IS NOT NULL THEN 'HasBonus'\r\n\t\t\t\t\t\tWHEN bi.Upload = 'Y' THEN 'Upload'\r\n\t\t\t\t\t\tELSE 'NotUpload'\r\n\t\t\t\t\tEND As Status\r\n                    ,bi.Bonus_Ref\r\n\t                ,bi.DateBookJW\r\n\t                ,bi.TimeBookJW\r\n\t                ,bi.AgentCode\r\n\t                ,bi.AgentName\r\n\t                ,bi.GuideCode\r\n\t                ,bi.GuideName\r\n\t                ,bi.TelGuide\r\n\t                ,bi.PartyCode\r\n\t                ,bi.Pax\r\n\t                ,bi.CarCode\r\n\t                ,bi.Remark\r\n\t                ,bi.ArriveDate\r\n\t                ,bi.DepartureDate\r\n\t                ,bi.NationCode\r\n\t                ,bi.FirstShop\r\n\t                ,bi.Complete\r\n\t                ,bi.Tel_Driver\r\n                    ,bi.DocDate\r\n                    ,bi.DocNo\r\n                    ,bi.Upload\r\n\t\t\t\t\t,bn.Code\r\n                FROM BookingInfor bi\r\n                    LEFT OUTER JOIN Bonus bn ON bi.DateBookJW=bn.Date and bi.Bonus_Ref=bn.Code\r\n                WHERE \r\n                    bi.DateBookJW='" + sQLDateTime + "'  \r\n                    " + text + "                   \r\n                ORDER BY \r\n                    " + text2 + "\r\n                    bi.DateBookJW,bi.TimeBookJW,bi.NationCode,bi.PartyCode\r\n                    ";
		return DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static bool IsCheckValidateBooking(DataRow row)
	{
		bool result = true;
		string text = row["DocNo"].ToString();
		string stringQuery = "\r\n                SELECT DocNo,AgentCode,PartyCode,DateBookJW,Bonus_Ref,Complete,NationCode,Upload \r\n                FROM BookingInfor \r\n                WHERE DocNo='" + text + "'\r\n                    ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			if (dataTable.Rows[0]["Complete"].ToString() == "N")
			{
				result = false;
			}
			if (dataTable.Rows[0]["NationCode"].ToString() == "")
			{
				result = false;
			}
			if (dataTable.Rows[0]["Bonus_Ref"].ToString() != "")
			{
				result = false;
			}
			if (dataTable.Rows[0]["Upload"].ToString() == "Y")
			{
				result = false;
			}
		}
		else
		{
			result = false;
		}
		return result;
	}

	public static bool IsCheckValidateBeforeUpload(DataRow row)
	{
		bool result = true;
		string text = row["DocNo"].ToString();
		string stringQuery = "\r\n                SELECT DocNo,AgentCode,PartyCode,DateBookJW,Bonus_Ref,Complete,NationCode,Upload \r\n                FROM BookingInfor \r\n                WHERE DocNo='" + text + "'\r\n                    ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			if (dataTable.Rows[0]["Complete"].ToString() == "N")
			{
				result = false;
			}
			if (dataTable.Rows[0]["NationCode"].ToString() == "")
			{
				result = false;
			}
			if (dataTable.Rows[0]["Bonus_Ref"].ToString() == "")
			{
				result = false;
			}
			if (dataTable.Rows[0]["Upload"].ToString() == "Y")
			{
				result = false;
			}
		}
		else
		{
			result = false;
		}
		return result;
	}

	public static bool IsHasBonusCodeInTableBonus(DateTime bonusDate, string bonusCode)
	{
		bool result = false;
		string sQLDateTime = Util.GetSQLDateTime(bonusDate);
		string stringQuery = "\r\n                SELECT Date,Code\r\n                FROM Bonus \r\n                WHERE Date='" + sQLDateTime + "' \r\n                    and code='" + bonusCode + "'\r\n                    ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			result = true;
		}
		return result;
	}

	public static bool IsHasBonusInBooking(DateTime bonusDate, string bonusCode)
	{
		bool result = false;
		string sQLDateTime = Util.GetSQLDateTime(bonusDate);
		string stringQuery = "\r\n                SELECT DocDate,DocNo,DateBookJW,Bonus_Ref,PartyCode\r\n                FROM BookingInfor\r\n                WHERE DateBookJW='" + sQLDateTime + "' \r\n                    and Bonus_Ref='" + bonusCode + "'\r\n                    ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			result = true;
		}
		return result;
	}

	public static void UpdateBonusRefToBookingInfor(string docNo, string bonusCode)
	{
		string stringQuery = "\r\n                UPDATE BookingInfor\r\n                SET Bonus_Ref='" + bonusCode + "'\r\n                WHERE DocNo='" + docNo + "'\r\n                ";
		DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static bool IsUploadDataToBonusList(string docNo)
	{
		bool result = false;
		string stringQuery = "\r\n                SELECT DocNo,Upload\r\n                FROM BookingInfor \r\n                WHERE DocNo='" + docNo + "' \r\n                    ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0 && dataTable.Rows[0]["Upload"].ToString() == "Y")
		{
			result = true;
		}
		return result;
	}

	public static void ClearBonusRefInBookingInfor(string docNo)
	{
		string stringQuery = "\r\n                UPDATE BookingInfor\r\n                SET Bonus_Ref=''\r\n                WHERE DocNo='" + docNo + "'\r\n                    ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
	}

	public static void InsertDataToBonusList(DataRow row)
	{
		string text = row["DocNo"].ToString();
		DateTime dt = Convert.ToDateTime(row["DateBookJW"]);
		string sQLDateTime = Util.GetSQLDateTime(dt);
		string text2 = row["Bonus_Ref"].ToString();
		int num = Convert.ToInt32(row["Pax"]);
		string text3 = "NO";
		string text4 = "1";
		string text5 = row["AgentCode"].ToString();
		string value = row["AgentName"].ToString() + " [" + row["GuideName"].ToString() + "]";
		value = value.TruncateString(150);
		string text6 = row["CarCode"].ToString();
		string text7 = row["NationCode"].ToString();
		string text8 = row["TimeBookJW"].ToString();
		string text9 = "";
		string text10 = "";
		string text11 = row["Remark"].ToString();
		string text12 = row["PartyCode"].ToString();
		string text13 = row["TelGuide"].ToString();
		string stringQuery = "\r\n\r\n        INSERT INTO [dbo].[Bonus_List]\r\n\t        (\r\n\t        [Date]\r\n\t        ,[Code]\r\n\t        ,[Name]\r\n\t        ,[Entry]\r\n\t        ,[CarCode]\r\n\t        ,[Man]\r\n\t        ,[TourBoss]\r\n\t        ,[Student]\r\n\t        ,[Child]\r\n\t        ,[Old]\r\n\t        ,[Other]\r\n\t        ,[Guide]\r\n\t        ,[Guide2]\r\n\t        ,[Guide3]\r\n\t        ,[Tour]\r\n\t        ,[Shop]\r\n\t        ,[Nation]\r\n\t        ,[TourIn]\r\n\t        ,[TourOut]\r\n\t        ,[PartyCode]\r\n\t        ,[ComeFrom]\r\n\t        ,[People]\r\n\t        ,[People2]\r\n\t        ,[Remark]\r\n\t        ,[Bus_Type]\r\n\t        ,[MDate]\r\n\t        ,[Phone]\r\n\t        ,[OnShop]\r\n\t        )\r\n        VALUES\r\n\t        (\r\n\t        '" + sQLDateTime + "'\r\n\t        ,'" + text2 + "'\r\n\t        ,'" + value + "'\r\n\t        ,'Booking'\r\n\t        ,'" + text6 + "'\r\n\t        ," + num + "\r\n\t        ,0\r\n\t        ,0\r\n\t        ,0\r\n\t        ,0\r\n\t        ,0\r\n\t        ,'" + text3 + "'\r\n\t        ,''\r\n\t        ,''\r\n\t        ,'" + text5 + "'\r\n\t        ,'" + text4 + "'\r\n\t        ,'" + text7 + "'\r\n\t        ,'" + text8 + "'\r\n\t        ,''\r\n\t        ,'" + text12 + "'\r\n\t        ,'" + text9 + "'\r\n\t        ," + num + "\r\n\t        ," + num + "\r\n\t        ,'" + text11 + "'\r\n\t        ,'" + text10 + "'\r\n\t        ,GetDate()\r\n\t        ,'" + text13 + "'\r\n\t        ,'Y'\r\n\t        )\r\n\r\n                    ";
		DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		string stringQuery2 = "\r\n                UPDATE BookingInfor\r\n                SET Upload='Y'\r\n                WHERE DocNo='" + text + "'\r\n                    ";
		DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery2);
	}

	public static void RemoveDataFromBonusList(DataRow row)
	{
		string text = row["DocNo"].ToString();
		DateTime dt = Convert.ToDateTime(row["DateBookJW"]);
		string sQLDateTime = Util.GetSQLDateTime(dt);
		string text2 = row["Bonus_Ref"].ToString();
		string stringQuery = "\r\n                DELETE Bonus_List\r\n                WHERE Date='" + sQLDateTime + "'\r\n                    and Code='" + text2 + "'\r\n                    ";
		DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		string stringQuery2 = "\r\n                UPDATE BookingInfor\r\n                SET Upload='N'\r\n                WHERE DocNo='" + text + "'\r\n                    ";
		DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery2);
	}

	public static void InsertDataToTableBonus(DataRow row)
	{
		string text = row["DocNo"].ToString();
		DateTime dt = Convert.ToDateTime(row["DateBookJW"]);
		string sQLDateTime = Util.GetSQLDateTime(dt);
		string text2 = row["Bonus_Ref"].ToString();
		int num = Convert.ToInt32(row["Pax"]);
		string bonusGuideValue = AppConfig.BonusGuideValue;
		string bonusShopValue = AppConfig.BonusShopValue;
		string text3 = row["AgentCode"].ToString();
		string value = row["AgentName"].ToString() + " [" + row["GuideName"].ToString() + "]";
		value = value.TruncateString(150);
		string text4 = row["CarCode"].ToString();
		string text5 = row["NationCode"].ToString();
		string text6 = row["TimeBookJW"].ToString();
		string text7 = "";
		string text8 = "";
		string text9 = row["Remark"].ToString();
		string text10 = row["PartyCode"].ToString();
		string text11 = row["TelGuide"].ToString();
		string text12 = "BookingUp";
		string stringQuery = "\r\n\r\n        INSERT INTO [dbo].[Bonus]\r\n\t        (\r\n\t        [Date]\r\n\t        ,[Code]\r\n\t        ,[Name]\r\n\t        ,[Entry]\r\n\t        ,[CarCode]\r\n\t        ,[Man]\r\n\t        ,[TourBoss]\r\n\t        ,[Student]\r\n\t        ,[Child]\r\n\t        ,[Old]\r\n\t        ,[Other]\r\n\t        ,[Guide]\r\n\t        ,[Guide2]\r\n\t        ,[Guide3]\r\n\t        ,[Tour]\r\n\t        ,[Shop]\r\n\t        ,[Nation]\r\n\t        ,[TourIn]\r\n\t        ,[TourOut]\r\n\t        ,[PartyCode]\r\n\t        ,[ComeFrom]\r\n\t        ,[People]\r\n\t        ,[People2]\r\n\t        ,[Remark]\r\n\t        ,[Bus_Type]\r\n\t        ,[MDate]\r\n\t        ,[Phone]\r\n\t        ,[OnShop]\r\n            ,[CreateBy]\r\n\t        )\r\n        VALUES\r\n\t        (\r\n\t        '" + sQLDateTime + "'\r\n\t        ,'" + text2 + "'\r\n\t        ,'" + value + "'\r\n\t        ,'Booking'\r\n\t        ,'" + text4 + "'\r\n\t        ," + num + "\r\n\t        ,0\r\n\t        ,0\r\n\t        ,0\r\n\t        ,0\r\n\t        ,0\r\n\t        ,'" + bonusGuideValue + "'\r\n\t        ,''\r\n\t        ,''\r\n\t        ,'" + text3 + "'\r\n\t        ,'" + bonusShopValue + "'\r\n\t        ,'" + text5 + "'\r\n\t        ,'" + text6 + "'\r\n\t        ,''\r\n\t        ,'" + text10 + "'\r\n\t        ,'" + text7 + "'\r\n\t        ," + num + "\r\n\t        ," + num + "\r\n\t        ,'" + text9 + "'\r\n\t        ,'" + text8 + "'\r\n\t        ,GetDate()\r\n\t        ,'" + text11 + "'\r\n\t        ,'Y'\r\n            ,'" + text12 + "'\r\n\t        )\r\n\r\n                    ";
		DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		string stringQuery2 = "\r\n                UPDATE BookingInfor\r\n                SET Upload='Y'\r\n                WHERE DocNo='" + text + "'\r\n                    ";
		DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery2);
	}

	public static bool IsHasBonusCodeWhenDateBookChange(string docNo, DateTime dateJWChange)
	{
		bool result = false;
		string stringQuery = "\r\n                    SELECT DocDate,DocNo,DateBookJW,Bonus_Ref \r\n                    FROM BookingInfor\r\n                    WHERE DocNo='" + docNo + "'\r\n                    ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			DateTime t = DateTime.Now;
			if (dataTable.Rows[0]["DateBookJW"] != DBNull.Value)
			{
				t = Convert.ToDateTime(dataTable.Rows[0]["DateBookJW"]);
			}
			string text = dataTable.Rows[0]["Bonus_Ref"].ToString();
			if (DateTime.Compare(t, dateJWChange) != 0 && text != "")
			{
				result = true;
			}
		}
		return result;
	}

	public static bool IsDateBookChange(string docNo, DateTime dateJWChange)
	{
		bool result = false;
		string stringQuery = "\r\n                    SELECT DocDate,DocNo,DateBookJW,Bonus_Ref \r\n                    FROM BookingInfor\r\n                    WHERE DocNo='" + docNo + "'\r\n                    ";
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable.Rows.Count > 0)
		{
			DateTime t = DateTime.Now;
			if (dataTable.Rows[0]["DateBookJW"] != DBNull.Value)
			{
				t = Convert.ToDateTime(dataTable.Rows[0]["DateBookJW"]);
			}
			if (DateTime.Compare(t, dateJWChange) != 0)
			{
				result = true;
			}
		}
		return result;
	}
}
