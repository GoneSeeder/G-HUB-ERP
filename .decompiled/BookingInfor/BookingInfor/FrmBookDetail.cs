using System;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Windows.Forms;
using BookingInfor.DB;
using DevExpress.Utils;
using DevExpress.XtraBars;
using DevExpress.XtraEditors;
using DevExpress.XtraEditors.Controls;
using DevExpress.XtraEditors.Mask;
using DevExpress.XtraGrid;
using DevExpress.XtraGrid.Columns;
using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraLayout;
using DevExpress.XtraLayout.Utils;

namespace BookingInfor;

public class FrmBookDetail : XtraForm
{
	private DataRow _row;

	private AppPrivilege.statusActive _statusActive;

	private string _docNo;

	private IContainer components = null;

	private BarManager barManager1;

	private Bar bar1;

	private BarLargeButtonItem btnSave;

	private BarStaticItem barStaticItem1;

	private BarLargeButtonItem btnCancel;

	private Bar bar3;

	private BarDockControl barDockControlTop;

	private BarDockControl barDockControlBottom;

	private BarDockControl barDockControlLeft;

	private BarDockControl barDockControlRight;

	private LayoutControl layoutControl1;

	private LayoutControlGroup layoutControlGroup1;

	private TextEdit txtTelGuide;

	private TextEdit txtTimeBookJW;

	private TextEdit txtRemark;

	private TextEdit txtCarCode;

	private TextEdit txtPartyCode;

	private TextEdit txtGuideName;

	private TextEdit txtGuideCode;

	private TextEdit txtAgentName;

	private TextEdit txtAgentCode;

	private TextEdit txtDocTime;

	private TextEdit txtDocNo;

	private LayoutControlItem layoutControlItem4;

	private LayoutControlItem layoutControlItem2;

	private LayoutControlItem layoutControlItem5;

	private LayoutControlItem layoutControlItem6;

	private LayoutControlItem layoutControlItem7;

	private LayoutControlItem layoutControlItem12;

	private LayoutControlItem layoutControlItem9;

	private LayoutControlItem layoutControlItem11;

	private LayoutControlGroup layoutControlGroup2;

	private LayoutControlItem layoutControlItem17;

	private LayoutControlGroup layoutControlGroup4;

	private LayoutControlItem layoutControlItem3;

	private LayoutControlItem layoutControlItem21;

	private BarLargeButtonItem btnDelete;

	private SpinEdit txtPax;

	private LayoutControlItem layoutControlItem8;

	private DateEdit txtDateBookTRP;

	private DateEdit txtDateBookRTH;

	private DateEdit txtDateBookBKF;

	private DateEdit txtDateBookJW;

	private LayoutControlItem layoutControlItem10;

	private LayoutControlItem layoutControlItem23;

	private LayoutControlItem layoutControlItem22;

	private LayoutControlItem layoutControlItem24;

	private BarStaticItem lblStatus;

	private DateEdit txtDocDate;

	private LayoutControlItem layoutControlItem13;

	private DateEdit txtPTYDateEnd;

	private DateEdit txtPTYDateStart;

	private TextEdit txtNationCode;

	private DateEdit txtDepartureDate;

	private DateEdit txtArriveDate;

	private LayoutControlItem layoutControlItem1;

	private LayoutControlItem layoutControlItem14;

	private LayoutControlItem layoutControlItem15;

	private LayoutControlGroup layoutControlGroup6;

	private LayoutControlItem layoutControlItem16;

	private LayoutControlItem layoutControlItem25;

	private TextEdit txtSeriesImport;

	private TextEdit txtKeyType;

	private TextEdit txtModifyBy;

	private TextEdit txtModifyDate;

	private TextEdit txtCreateDate;

	private TextEdit txtCreateBy;

	private TextEdit txtRemarkBook;

	private LayoutControlItem layoutControlItem26;

	private LayoutControlGroup layoutControlGroup7;

	private LayoutControlItem layoutControlItem28;

	private LayoutControlItem layoutControlItem29;

	private LayoutControlItem layoutControlItem31;

	private LayoutControlItem layoutControlItem32;

	private LayoutControlItem layoutControlItem30;

	private LayoutControlItem layoutControlItem27;

	private LookUpEdit txtFirstShop;

	private LayoutControlItem layoutControlItem33;

	private TextEdit txtAgentCodeRef;

	private TextEdit txtFaxNoRef;

	private TextEdit txtOrderDateRef;

	private LayoutControlGroup layoutControlGroup8;

	private LayoutControlItem layoutControlItem34;

	private LayoutControlItem layoutControlItem35;

	private LayoutControlItem layoutControlItem36;

	private EmptySpaceItem emptySpaceItem1;

	private EmptySpaceItem emptySpaceItem2;

	private LayoutControlGroup layoutControlGroup9;

	private TextEdit txtPartyCodeRef;

	private GridControl gridControl1;

	private GridView gridView1;

	private GridColumn gridColumn1;

	private GridColumn gridColumn2;

	private GridColumn gridColumn3;

	private GridColumn gridColumn4;

	private GridColumn gridColumn5;

	private GridColumn gridColumn6;

	private GridColumn gridColumn7;

	private LayoutControlItem layoutControlItem37;

	private LayoutControlItem layoutControlItem38;

	private CheckEdit checkEdit1;

	private LayoutControlItem layoutControlItem18;

	private TextEdit txtTelDriver;

	private LayoutControlItem layoutControlItem19;

	private EmptySpaceItem emptySpaceItem3;

	private BarStaticItem barStaticItem2;

	private BarLargeButtonItem btnMoveFirst;

	private BarLargeButtonItem btnMovePrev;

	private BarLargeButtonItem btnMoveNext;

	private BarLargeButtonItem btnMoveLast;

	public bool isEdit { get; set; }

	public FrmBookDetail(AppPrivilege.statusActive statusActive)
	{
		InitializeComponent();
		_statusActive = statusActive;
		InitScreenPage();
		InitComboValue();
		InitValueNew();
		enableControlButton("AddNew");
		base.ActiveControl = txtAgentCode;
	}

	public FrmBookDetail(AppPrivilege.statusActive statusActive, DataRow row, string rType)
	{
		InitializeComponent();
		_statusActive = statusActive;
		_row = row;
		InitScreenPage();
		InitComboValue();
		enableControlButton(rType);
		string documentNo = _row["DocNo"].ToString();
		ShowData(documentNo);
		base.ActiveControl = txtAgentCode;
	}

	private void InitScreenPage()
	{
	}

	private void InitValueNew()
	{
		string text = DataSQL.GenerateDocNo();
		txtDocNo.Text = text;
		txtDocDate.EditValue = ParaClass.ServerDate;
		string serverTime = DataSQL.GetServerTime();
		txtDocTime.Text = serverTime;
		txtFirstShop.EditValue = "G";
		txtKeyType.Text = "UserKey";
		txtCreateBy.Text = ParaClass.UserLogin;
		txtModifyBy.Text = ParaClass.UserLogin;
	}

	private void InitComboValue()
	{
		DataTable dataTable = new DataTable();
		dataTable.Columns.Add("ID", typeof(string));
		dataTable.Rows.Add("G");
		dataTable.Rows.Add("W");
		dataTable.Rows.Add("N");
		txtFirstShop.Properties.DataSource = dataTable;
		txtFirstShop.Properties.DisplayMember = "ID";
		txtFirstShop.Properties.ValueMember = "ID";
		txtFirstShop.Properties.NullText = "Please select Cost Type";
	}

	private void ClearScreen()
	{
		txtDocDate.EditValue = ParaClass.ServerDate;
		txtDocNo.Text = "";
		txtDocTime.Text = "";
		txtAgentCode.Text = "";
		txtAgentName.Text = "";
		txtPartyCode.Text = "";
		txtGuideCode.Text = "";
		txtGuideName.Text = "";
		txtTelGuide.Text = "";
		txtTelDriver.Text = "";
		txtCarCode.Text = "";
		txtPax.EditValue = 0;
		txtRemark.Text = "";
		txtDateBookJW.EditValue = null;
		txtTimeBookJW.Text = "";
		txtDateBookBKF.EditValue = null;
		txtDateBookRTH.EditValue = null;
		txtDateBookTRP.EditValue = null;
		txtPTYDateStart.EditValue = null;
		txtPTYDateEnd.EditValue = null;
		txtArriveDate.EditValue = null;
		txtDepartureDate.EditValue = null;
		txtNationCode.Text = "";
		txtFirstShop.EditValue = null;
		txtOrderDateRef.Text = "";
		txtFaxNoRef.Text = "";
		txtAgentCodeRef.Text = "";
		txtPartyCodeRef.Text = "";
		txtRemarkBook.Text = "";
		txtCreateDate.Text = "";
		txtCreateBy.Text = "";
		txtModifyDate.Text = "";
		txtModifyBy.Text = "";
		txtKeyType.Text = "";
		txtSeriesImport.Text = "";
		checkEdit1.Checked = false;
		BindData(gridControl1, null);
	}

	private void enableControlButton(string rType)
	{
		if (rType == "Delete")
		{
			btnSave.Visibility = BarItemVisibility.Never;
			btnDelete.Visibility = BarItemVisibility.Always;
			layoutControl1.Enabled = false;
			lblStatus.Caption = "Status[Delete]";
			return;
		}
		btnSave.Visibility = BarItemVisibility.Always;
		btnDelete.Visibility = BarItemVisibility.Never;
		if (rType == "Edit")
		{
			lblStatus.Caption = "Status[Edit]";
		}
		else
		{
			lblStatus.Caption = "Status[AddNew]";
		}
	}

	private void ShowData(string documentNo)
	{
		ClearScreen();
		lblStatus.Caption = "Status[Edit]";
		DataTable bookingDetail = DataSQL.GetBookingDetail(documentNo);
		txtDocDate.EditValue = Convert.ToDateTime(bookingDetail.Rows[0]["DocDate"]);
		txtDocNo.Text = documentNo;
		txtDocTime.Text = bookingDetail.Rows[0]["DocTime"].ToString();
		txtAgentCode.Text = bookingDetail.Rows[0]["AgentCode"].ToString();
		txtAgentName.Text = bookingDetail.Rows[0]["AgentName"].ToString();
		txtGuideCode.Text = bookingDetail.Rows[0]["GuideCode"].ToString();
		txtGuideName.Text = bookingDetail.Rows[0]["GuideName"].ToString();
		txtPartyCode.Text = bookingDetail.Rows[0]["PartyCode"].ToString();
		txtTelGuide.Text = bookingDetail.Rows[0]["TelGuide"].ToString();
		txtTelDriver.Text = bookingDetail.Rows[0]["Tel_Driver"].ToString();
		txtPax.EditValue = Convert.ToInt16(bookingDetail.Rows[0]["Pax"]);
		txtCarCode.Text = bookingDetail.Rows[0]["CarCode"].ToString();
		txtRemark.Text = bookingDetail.Rows[0]["Remark"].ToString();
		if (bookingDetail.Rows[0]["DateBookJW"] == DBNull.Value)
		{
			txtDateBookJW.EditValue = null;
		}
		else
		{
			txtDateBookJW.EditValue = Convert.ToDateTime(bookingDetail.Rows[0]["DateBookJW"]);
		}
		txtTimeBookJW.Text = bookingDetail.Rows[0]["TimeBookJW"].ToString();
		if (bookingDetail.Rows[0]["DateBookBKF"] == DBNull.Value)
		{
			txtDateBookBKF.EditValue = null;
		}
		else
		{
			txtDateBookBKF.EditValue = Convert.ToDateTime(bookingDetail.Rows[0]["DateBookBKF"]);
		}
		if (bookingDetail.Rows[0]["DateBookRTH"] == DBNull.Value)
		{
			txtDateBookRTH.EditValue = null;
		}
		else
		{
			txtDateBookRTH.EditValue = Convert.ToDateTime(bookingDetail.Rows[0]["DateBookRTH"]);
		}
		if (bookingDetail.Rows[0]["DateBookTRP"] == DBNull.Value)
		{
			txtDateBookTRP.EditValue = null;
		}
		else
		{
			txtDateBookTRP.EditValue = Convert.ToDateTime(bookingDetail.Rows[0]["DateBookTRP"]);
		}
		if (bookingDetail.Rows[0]["ArriveDate"] == DBNull.Value)
		{
			txtArriveDate.EditValue = null;
		}
		else
		{
			txtArriveDate.EditValue = Convert.ToDateTime(bookingDetail.Rows[0]["ArriveDate"]);
		}
		if (bookingDetail.Rows[0]["DepartureDate"] == DBNull.Value)
		{
			txtDepartureDate.EditValue = null;
		}
		else
		{
			txtDepartureDate.EditValue = Convert.ToDateTime(bookingDetail.Rows[0]["DepartureDate"]);
		}
		txtNationCode.Text = bookingDetail.Rows[0]["NationCode"].ToString();
		txtFirstShop.EditValue = bookingDetail.Rows[0]["FirstShop"].ToString();
		if (bookingDetail.Rows[0]["PTYDateStart"] == DBNull.Value)
		{
			txtPTYDateStart.EditValue = null;
		}
		else
		{
			txtPTYDateStart.EditValue = Convert.ToDateTime(bookingDetail.Rows[0]["PTYDateStart"]);
		}
		if (bookingDetail.Rows[0]["PTYDateEnd"] == DBNull.Value)
		{
			txtPTYDateEnd.EditValue = null;
		}
		else
		{
			txtPTYDateEnd.EditValue = Convert.ToDateTime(bookingDetail.Rows[0]["PTYDateEnd"]);
		}
		if (bookingDetail.Rows[0]["OrderDate_Ref"] == DBNull.Value)
		{
			txtOrderDateRef.EditValue = null;
		}
		else
		{
			txtOrderDateRef.EditValue = Convert.ToDateTime(bookingDetail.Rows[0]["OrderDate_Ref"]);
		}
		txtAgentCodeRef.Text = bookingDetail.Rows[0]["AgentCode_Ref"].ToString();
		txtFaxNoRef.Text = bookingDetail.Rows[0]["FaxNo_Ref"].ToString();
		txtPartyCodeRef.Text = bookingDetail.Rows[0]["PartyCode_Ref"].ToString();
		txtRemarkBook.Text = bookingDetail.Rows[0]["Remark_Book"].ToString();
		if (bookingDetail.Rows[0]["Complete"].ToString() == "Y")
		{
			checkEdit1.Checked = true;
		}
		else
		{
			checkEdit1.Checked = false;
		}
		txtCreateDate.Text = bookingDetail.Rows[0]["CreateDate"].ToString();
		txtCreateBy.Text = bookingDetail.Rows[0]["CreateBy"].ToString();
		txtModifyDate.Text = bookingDetail.Rows[0]["ModifyDate"].ToString();
		txtModifyBy.Text = bookingDetail.Rows[0]["ModifyBy"].ToString();
		txtSeriesImport.Text = bookingDetail.Rows[0]["Import_SeriesNo"].ToString();
		txtKeyType.Text = bookingDetail.Rows[0]["ImportType"].ToString();
		DataTable faxOrderPlace = DataSQL.GetFaxOrderPlace(documentNo);
		BindData(gridControl1, faxOrderPlace);
		gridView1.BestFitColumns();
	}

	private void BindData(GridControl gridControl, DataTable dt)
	{
		gridControl.BeginUpdate();
		gridControl.DataSource = null;
		gridControl.DataSource = dt;
		gridControl.EndUpdate();
	}

	private void btnCancel_ItemClick(object sender, ItemClickEventArgs e)
	{
		base.DialogResult = DialogResult.Cancel;
	}

	private void btnSave_ItemClick(object sender, ItemClickEventArgs e)
	{
		string docNo = txtDocNo.Text;
		if (AppConfig.AllowCreateBonusList)
		{
			bool flag = DataSQL.IsUploadDataToBonusList(docNo);
			if (flag && AppPrivilege.Level == AppPrivilege.PrivilageLevel.User)
			{
				MessageBox.Show("ข\u0e49อม\u0e39ลม\u0e35การ Upload แล\u0e49วไม\u0e48สามารถ บ\u0e31นท\u0e36กได\u0e49", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
				return;
			}
			DateTime dateJWChange = DateTime.Now;
			if (txtDateBookJW.EditValue != null)
			{
				dateJWChange = Convert.ToDateTime(txtDateBookJW.EditValue);
			}
			if (flag && DataSQL.IsDateBookChange(docNo, dateJWChange))
			{
				MessageBox.Show("ข\u0e49อม\u0e39ลม\u0e35การ Upload แล\u0e49ว ไม\u0e48สามารถเปล\u0e35\u0e48ยนว\u0e31นท\u0e35\u0e48 book ได\u0e49", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
				return;
			}
			if (DataSQL.IsHasBonusCodeWhenDateBookChange(docNo, dateJWChange))
			{
				switch (MessageBox.Show("ม\u0e35การเปล\u0e35\u0e48ยนว\u0e31นท\u0e35\u0e48 Shoping และ booking น\u0e35\u0e49ม\u0e35การ Gen. Bonus Code แล\u0e49ว ต\u0e49องการให\u0e49 Clear หร\u0e37อไม\u0e48 ถ\u0e49าไม\u0e48เคล\u0e35ยร\u0e4cจะบ\u0e31นท\u0e36กไม\u0e48ได\u0e49", "Confirm Clear Bonus Code", MessageBoxButtons.YesNo))
				{
				case DialogResult.Yes:
					DataSQL.ClearBonusRefInBookingInfor(docNo);
					break;
				case DialogResult.No:
					MessageBox.Show("ตอบ No ไม\u0e48สามารถบ\u0e31นท\u0e36กได\u0e49", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
					return;
				}
			}
		}
		checkDuplicatePartyCode();
		bookArg bookArg = new bookArg();
		bookArg.docDate = Convert.ToDateTime(txtDocDate.EditValue);
		bookArg.docTime = txtDocTime.Text;
		bookArg.docNo = docNo;
		bookArg.agentCode = txtAgentCode.Text;
		bookArg.agentName = txtAgentName.Text;
		bookArg.partyCode = txtPartyCode.Text;
		bookArg.guideCode = txtGuideCode.Text;
		bookArg.guideName = txtGuideName.Text;
		bookArg.telGuide = txtTelGuide.Text;
		bookArg.telDriver = txtTelDriver.Text;
		bookArg.carCode = txtCarCode.Text;
		bookArg.pax = Convert.ToInt16(txtPax.EditValue);
		bookArg.remark = txtRemark.Text;
		if (txtDateBookJW.EditValue == null)
		{
			bookArg.dateBookJW = null;
		}
		else
		{
			bookArg.dateBookJW = Convert.ToDateTime(txtDateBookJW.EditValue);
		}
		string text = txtTimeBookJW.Text;
		if (text.Contains('_'))
		{
			bookArg.timeBookJW = "";
		}
		else
		{
			bookArg.timeBookJW = text;
		}
		if (txtDateBookBKF.EditValue == null)
		{
			bookArg.dateBookBKF = null;
		}
		else
		{
			bookArg.dateBookBKF = Convert.ToDateTime(txtDateBookBKF.EditValue);
		}
		bookArg.timeBookBKF = "";
		if (txtDateBookRTH.EditValue == null)
		{
			bookArg.dateBookRTH = null;
		}
		else
		{
			bookArg.dateBookRTH = Convert.ToDateTime(txtDateBookRTH.EditValue);
		}
		bookArg.timeBookRTH = "";
		if (txtDateBookTRP.EditValue == null)
		{
			bookArg.dateBookTRP = null;
		}
		else
		{
			bookArg.dateBookTRP = Convert.ToDateTime(txtDateBookTRP.EditValue);
		}
		bookArg.timeBookTRP = "";
		if (txtArriveDate.EditValue == null)
		{
			bookArg.arriveDate = null;
		}
		else
		{
			bookArg.arriveDate = Convert.ToDateTime(txtArriveDate.EditValue);
		}
		if (txtDepartureDate.EditValue == null)
		{
			bookArg.departureDate = null;
		}
		else
		{
			bookArg.departureDate = Convert.ToDateTime(txtDepartureDate.EditValue);
		}
		bookArg.nationCode = txtNationCode.Text;
		bookArg.firstShop = txtFirstShop.EditValue.ToString();
		if (txtPTYDateStart.EditValue == null)
		{
			bookArg.ptyDateStart = null;
		}
		else
		{
			bookArg.ptyDateStart = Convert.ToDateTime(txtPTYDateStart.EditValue);
		}
		if (txtPTYDateEnd.EditValue == null)
		{
			bookArg.ptyDateEnd = null;
		}
		else
		{
			bookArg.ptyDateEnd = Convert.ToDateTime(txtPTYDateEnd.EditValue);
		}
		if (checkEdit1.Checked)
		{
			bookArg.complete = "Y";
		}
		else
		{
			bookArg.complete = "N";
		}
		bookArg.orderDate = null;
		bookArg.faxNo = 0;
		bookArg.agentCodeRef = "";
		if (txtKeyType.Text.ToUpper() == "USERKEY")
		{
			bookArg.partyCodeRef = txtPartyCode.Text;
		}
		else
		{
			bookArg.partyCodeRef = txtPartyCodeRef.Text;
		}
		bookArg.remarkBook = "";
		bookArg.seriesNo = 0;
		if (!isEdit)
		{
			bookArg.importType = "UserKey";
		}
		DataSQL.SaveBookingData(isEdit, bookArg);
		MessageBox.Show("Save Complete");
		if (!isEdit)
		{
			isEdit = true;
			lblStatus.Caption = "Status[Edit]";
		}
		base.ActiveControl = txtAgentCode;
	}

	private void btnDelete_ItemClick(object sender, ItemClickEventArgs e)
	{
		DialogResult dialogResult = XtraMessageBox.Show("Do you want to Delete?", "Confirmation Delete", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2);
		if (dialogResult == DialogResult.Yes)
		{
			string docNo = txtDocNo.Text;
			if (AppConfig.AllowCreateBonusList && DataSQL.IsUploadDataToBonusList(docNo))
			{
				MessageBox.Show("ข\u0e49อม\u0e39ลม\u0e35การ Upload แล\u0e49วไม\u0e48สามารถลบรายการได\u0e49", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
			else if (DataSQL.DeleteBookingData(docNo))
			{
				base.DialogResult = DialogResult.OK;
			}
			else
			{
				base.DialogResult = DialogResult.Cancel;
			}
		}
	}

	private void txtAgentCode_KeyDown(object sender, KeyEventArgs e)
	{
		if (e.KeyCode == Keys.Return)
		{
			ParaClass.rRef = "";
			CheckRefSQL(txtAgentCode);
			txtAgentCode.Text = StCl.MT.MidPart(ParaClass.rRef, ",", 1);
			txtAgentName.Text = StCl.MT.MidPart(ParaClass.rRef, ",", 2);
		}
	}

	private void CheckRefSQL(TextEdit txtName)
	{
		string text = "";
		string text2 = "";
		string text3 = "";
		string text4 = "";
		string text5 = "";
		string text6 = "";
		switch (txtName.Name)
		{
		case "txtAgentCode":
			text = "Tour";
			text2 = "Code";
			text3 = "Code,Name";
			text6 = "Code,Name";
			break;
		case "txtGuideCode":
			text = "Guide";
			text2 = "Code";
			text3 = "Code,Name,ID_No,Phone,Remark,Thai";
			text6 = "Code,Name";
			break;
		case "txtNationCode":
			text = "Nation";
			text2 = "Nation_Code";
			text3 = "Nation_Code,Nation_Name";
			text6 = "Nation_Code,Nation_Name";
			break;
		}
		if (!(text != "") || !(text2 != "") || !(text3 != "") || !(text6 != ""))
		{
			return;
		}
		text5 = txtName.Text;
		string stringQuery = "Select " + text3 + " from " + text + " Where " + text2 + "='" + text5 + "' " + text4;
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		if (dataTable != null && dataTable.Rows.Count > 0)
		{
			ParaClass.rRef = "";
			int num = StCl.MT.CountString(text6, ",");
			for (int i = 1; i <= num + 1; i++)
			{
				if (ParaClass.rRef != "")
				{
					ParaClass.rRef += ",";
				}
				string columnName = StCl.MT.MidPart(text6, ",", i);
				if (dataTable.Rows[0][columnName].ToString() != "" || dataTable.Rows[0][columnName] != null)
				{
					ParaClass.rRef += dataTable.Rows[0][columnName].ToString();
				}
				else
				{
					ParaClass.rRef += " ";
				}
			}
			return;
		}
		ParaClass.rRefFields = "Select " + text3 + " from " + text + " Where " + text2 + " like '" + text5 + "%' " + text4;
		ParaClass.rRef = text6;
		RefSQL refSQL = new RefSQL();
		refSQL.ShowInTaskbar = false;
		if (refSQL.DialogResult != DialogResult.Cancel)
		{
			refSQL.ShowDialog();
		}
	}

	private void txtGuideCode_KeyDown(object sender, KeyEventArgs e)
	{
		if (e.KeyCode == Keys.Return)
		{
			ParaClass.rRef = "";
			CheckRefSQL(txtGuideCode);
			txtGuideCode.Text = StCl.MT.MidPart(ParaClass.rRef, ",", 1);
			txtGuideName.Text = StCl.MT.MidPart(ParaClass.rRef, ",", 2);
		}
	}

	private void txtNationCode_KeyDown(object sender, KeyEventArgs e)
	{
		if (e.KeyCode == Keys.Return)
		{
			ParaClass.rRef = "";
			CheckRefSQL(txtNationCode);
			txtNationCode.Text = StCl.MT.MidPart(ParaClass.rRef, ",", 1);
		}
	}

	private void txtRemark_KeyDown(object sender, KeyEventArgs e)
	{
	}

	private void txtPartyCode_KeyDown(object sender, KeyEventArgs e)
	{
		if (e.KeyCode == Keys.Return)
		{
			checkDuplicatePartyCode();
		}
	}

	private void checkDuplicatePartyCode()
	{
		string text = txtPartyCode.Text;
		string docNo = txtDocNo.Text;
		DateTime docDate = Convert.ToDateTime(txtDocDate.EditValue);
		DataTable dataTable = DataSQL.IsDuplicatePartyCode(text, docNo, docDate);
		if (dataTable.Rows.Count > 0)
		{
			string text2 = dataTable.Rows[0]["CarCode"].ToString();
			string text3 = "";
			if (dataTable.Rows[0]["ArriveDate"] != DBNull.Value)
			{
				text3 = dataTable.Rows[0]["ArriveDate"].ToString();
			}
			XtraMessageBox.Show("PartyCode " + text + "  ซ\u0e49ำ (Arrive Date = " + text3 + " ; CarCode = " + text2 + " ) ", "Duplicate PartyCode");
		}
	}

	private void btnMoveFirst_ItemClick(object sender, ItemClickEventArgs e)
	{
		MoveBookingData(AppPrivilege.statusMove.MoveLast);
	}

	private void btnMovePrev_ItemClick(object sender, ItemClickEventArgs e)
	{
		MoveBookingData(AppPrivilege.statusMove.MoveNext);
	}

	private void btnMoveNext_ItemClick(object sender, ItemClickEventArgs e)
	{
		MoveBookingData(AppPrivilege.statusMove.MovePrevious);
	}

	private void btnMoveLast_ItemClick(object sender, ItemClickEventArgs e)
	{
		MoveBookingData(AppPrivilege.statusMove.MoveFirst);
	}

	private void MoveBookingData(AppPrivilege.statusMove moveType)
	{
		DataTable dataTable = null;
		string docNo = txtDocNo.Text;
		dataTable = DataSQL.GetDataBookingMove(_statusActive, moveType, docNo);
		if (dataTable.Rows.Count > 0)
		{
			string documentNo = dataTable.Rows[0]["DocNo"].ToString();
			ShowData(documentNo);
			enableControlButton("Edit");
			base.ActiveControl = txtAgentCode;
		}
	}

	protected override void Dispose(bool disposing)
	{
		if (disposing && components != null)
		{
			components.Dispose();
		}
		base.Dispose(disposing);
	}

	private void InitializeComponent()
	{
		this.components = new System.ComponentModel.Container();
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BookingInfor.FrmBookDetail));
		this.barManager1 = new DevExpress.XtraBars.BarManager(this.components);
		this.bar1 = new DevExpress.XtraBars.Bar();
		this.btnSave = new DevExpress.XtraBars.BarLargeButtonItem();
		this.btnDelete = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem1 = new DevExpress.XtraBars.BarStaticItem();
		this.btnCancel = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem2 = new DevExpress.XtraBars.BarStaticItem();
		this.btnMoveFirst = new DevExpress.XtraBars.BarLargeButtonItem();
		this.btnMovePrev = new DevExpress.XtraBars.BarLargeButtonItem();
		this.btnMoveNext = new DevExpress.XtraBars.BarLargeButtonItem();
		this.btnMoveLast = new DevExpress.XtraBars.BarLargeButtonItem();
		this.bar3 = new DevExpress.XtraBars.Bar();
		this.lblStatus = new DevExpress.XtraBars.BarStaticItem();
		this.barDockControlTop = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlBottom = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlLeft = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlRight = new DevExpress.XtraBars.BarDockControl();
		this.layoutControl1 = new DevExpress.XtraLayout.LayoutControl();
		this.txtTelDriver = new DevExpress.XtraEditors.TextEdit();
		this.checkEdit1 = new DevExpress.XtraEditors.CheckEdit();
		this.txtPartyCodeRef = new DevExpress.XtraEditors.TextEdit();
		this.gridControl1 = new DevExpress.XtraGrid.GridControl();
		this.gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
		this.gridColumn1 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn2 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn3 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn4 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn5 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn6 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn7 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.txtAgentCodeRef = new DevExpress.XtraEditors.TextEdit();
		this.txtFaxNoRef = new DevExpress.XtraEditors.TextEdit();
		this.txtOrderDateRef = new DevExpress.XtraEditors.TextEdit();
		this.txtFirstShop = new DevExpress.XtraEditors.LookUpEdit();
		this.txtSeriesImport = new DevExpress.XtraEditors.TextEdit();
		this.txtKeyType = new DevExpress.XtraEditors.TextEdit();
		this.txtModifyBy = new DevExpress.XtraEditors.TextEdit();
		this.txtModifyDate = new DevExpress.XtraEditors.TextEdit();
		this.txtCreateDate = new DevExpress.XtraEditors.TextEdit();
		this.txtCreateBy = new DevExpress.XtraEditors.TextEdit();
		this.txtRemarkBook = new DevExpress.XtraEditors.TextEdit();
		this.txtPTYDateEnd = new DevExpress.XtraEditors.DateEdit();
		this.txtPTYDateStart = new DevExpress.XtraEditors.DateEdit();
		this.txtNationCode = new DevExpress.XtraEditors.TextEdit();
		this.txtDepartureDate = new DevExpress.XtraEditors.DateEdit();
		this.txtArriveDate = new DevExpress.XtraEditors.DateEdit();
		this.txtDocDate = new DevExpress.XtraEditors.DateEdit();
		this.txtDateBookTRP = new DevExpress.XtraEditors.DateEdit();
		this.txtDateBookRTH = new DevExpress.XtraEditors.DateEdit();
		this.txtDateBookBKF = new DevExpress.XtraEditors.DateEdit();
		this.txtDateBookJW = new DevExpress.XtraEditors.DateEdit();
		this.txtPax = new DevExpress.XtraEditors.SpinEdit();
		this.txtTelGuide = new DevExpress.XtraEditors.TextEdit();
		this.txtTimeBookJW = new DevExpress.XtraEditors.TextEdit();
		this.txtRemark = new DevExpress.XtraEditors.TextEdit();
		this.txtCarCode = new DevExpress.XtraEditors.TextEdit();
		this.txtPartyCode = new DevExpress.XtraEditors.TextEdit();
		this.txtGuideName = new DevExpress.XtraEditors.TextEdit();
		this.txtGuideCode = new DevExpress.XtraEditors.TextEdit();
		this.txtAgentName = new DevExpress.XtraEditors.TextEdit();
		this.txtAgentCode = new DevExpress.XtraEditors.TextEdit();
		this.txtDocTime = new DevExpress.XtraEditors.TextEdit();
		this.txtDocNo = new DevExpress.XtraEditors.TextEdit();
		this.layoutControlGroup1 = new DevExpress.XtraLayout.LayoutControlGroup();
		this.layoutControlGroup2 = new DevExpress.XtraLayout.LayoutControlGroup();
		this.layoutControlItem10 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem17 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlGroup4 = new DevExpress.XtraLayout.LayoutControlGroup();
		this.layoutControlItem23 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem22 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem24 = new DevExpress.XtraLayout.LayoutControlItem();
		this.emptySpaceItem1 = new DevExpress.XtraLayout.EmptySpaceItem();
		this.layoutControlGroup8 = new DevExpress.XtraLayout.LayoutControlGroup();
		this.layoutControlItem34 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem26 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem36 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem37 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem38 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem35 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlGroup7 = new DevExpress.XtraLayout.LayoutControlGroup();
		this.layoutControlItem28 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem29 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem27 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem30 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem32 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem31 = new DevExpress.XtraLayout.LayoutControlItem();
		this.emptySpaceItem2 = new DevExpress.XtraLayout.EmptySpaceItem();
		this.layoutControlGroup9 = new DevExpress.XtraLayout.LayoutControlGroup();
		this.layoutControlItem13 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem3 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem2 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem4 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem5 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem9 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem6 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem7 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem21 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem11 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem12 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem18 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem14 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem15 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem1 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem33 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem8 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem19 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlGroup6 = new DevExpress.XtraLayout.LayoutControlGroup();
		this.layoutControlItem16 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem25 = new DevExpress.XtraLayout.LayoutControlItem();
		this.emptySpaceItem3 = new DevExpress.XtraLayout.EmptySpaceItem();
		((System.ComponentModel.ISupportInitialize)this.barManager1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControl1).BeginInit();
		this.layoutControl1.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.txtTelDriver.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.checkEdit1.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtPartyCodeRef.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentCodeRef.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtFaxNoRef.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtOrderDateRef.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtFirstShop.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtSeriesImport.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtKeyType.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtModifyBy.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtModifyDate.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtCreateDate.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtCreateBy.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtRemarkBook.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtPTYDateEnd.Properties.CalendarTimeProperties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtPTYDateEnd.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtPTYDateStart.Properties.CalendarTimeProperties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtPTYDateStart.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtNationCode.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDepartureDate.Properties.CalendarTimeProperties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDepartureDate.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtArriveDate.Properties.CalendarTimeProperties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtArriveDate.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDocDate.Properties.CalendarTimeProperties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDocDate.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookTRP.Properties.CalendarTimeProperties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookTRP.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookRTH.Properties.CalendarTimeProperties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookRTH.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookBKF.Properties.CalendarTimeProperties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookBKF.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookJW.Properties.CalendarTimeProperties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookJW.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtPax.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtTelGuide.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtTimeBookJW.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtRemark.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtCarCode.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtPartyCode.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtGuideName.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtGuideCode.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentName.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentCode.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDocTime.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtDocNo.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem10).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem17).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup4).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem23).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem22).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem24).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.emptySpaceItem1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup8).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem34).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem26).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem36).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem37).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem38).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem35).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup7).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem28).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem29).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem27).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem30).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem32).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem31).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.emptySpaceItem2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup9).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem13).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem3).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem4).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem5).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem9).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem6).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem7).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem21).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem11).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem12).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem18).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem14).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem15).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem33).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem8).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem19).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup6).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem16).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem25).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.emptySpaceItem3).BeginInit();
		base.SuspendLayout();
		this.barManager1.Bars.AddRange(new DevExpress.XtraBars.Bar[2] { this.bar1, this.bar3 });
		this.barManager1.DockControls.Add(this.barDockControlTop);
		this.barManager1.DockControls.Add(this.barDockControlBottom);
		this.barManager1.DockControls.Add(this.barDockControlLeft);
		this.barManager1.DockControls.Add(this.barDockControlRight);
		this.barManager1.Form = this;
		this.barManager1.Items.AddRange(new DevExpress.XtraBars.BarItem[10] { this.btnSave, this.barStaticItem1, this.btnCancel, this.btnDelete, this.lblStatus, this.barStaticItem2, this.btnMoveFirst, this.btnMovePrev, this.btnMoveNext, this.btnMoveLast });
		this.barManager1.MaxItemId = 10;
		this.barManager1.StatusBar = this.bar3;
		this.bar1.BarName = "Tools";
		this.bar1.DockCol = 0;
		this.bar1.DockRow = 0;
		this.bar1.DockStyle = DevExpress.XtraBars.BarDockStyle.Top;
		this.bar1.LinksPersistInfo.AddRange(new DevExpress.XtraBars.LinkPersistInfo[9]
		{
			new DevExpress.XtraBars.LinkPersistInfo(this.btnSave),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnDelete),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem1),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnCancel),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem2),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnMoveFirst),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnMovePrev),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnMoveNext),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnMoveLast)
		});
		this.bar1.OptionsBar.DrawBorder = false;
		this.bar1.OptionsBar.DrawDragBorder = false;
		this.bar1.Text = "Tools";
		this.btnSave.Caption = "Save Data";
		this.btnSave.Glyph = (System.Drawing.Image)resources.GetObject("btnSave.Glyph");
		this.btnSave.Id = 0;
		this.btnSave.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnSave.LargeGlyph");
		this.btnSave.Name = "btnSave";
		this.btnSave.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnSave_ItemClick);
		this.btnDelete.Caption = "Delete Data";
		this.btnDelete.Glyph = (System.Drawing.Image)resources.GetObject("btnDelete.Glyph");
		this.btnDelete.Id = 3;
		this.btnDelete.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnDelete.LargeGlyph");
		this.btnDelete.Name = "btnDelete";
		this.btnDelete.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnDelete_ItemClick);
		this.barStaticItem1.Id = 1;
		this.barStaticItem1.Name = "barStaticItem1";
		this.barStaticItem1.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnCancel.Caption = "Cancel";
		this.btnCancel.Glyph = (System.Drawing.Image)resources.GetObject("btnCancel.Glyph");
		this.btnCancel.Id = 2;
		this.btnCancel.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnCancel.LargeGlyph");
		this.btnCancel.Name = "btnCancel";
		this.btnCancel.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnCancel_ItemClick);
		this.barStaticItem2.Id = 5;
		this.barStaticItem2.Name = "barStaticItem2";
		this.barStaticItem2.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnMoveFirst.Caption = "Move First";
		this.btnMoveFirst.Glyph = (System.Drawing.Image)resources.GetObject("btnMoveFirst.Glyph");
		this.btnMoveFirst.Id = 6;
		this.btnMoveFirst.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnMoveFirst.LargeGlyph");
		this.btnMoveFirst.Name = "btnMoveFirst";
		this.btnMoveFirst.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnMoveFirst_ItemClick);
		this.btnMovePrev.Caption = "Move Previous";
		this.btnMovePrev.Glyph = (System.Drawing.Image)resources.GetObject("btnMovePrev.Glyph");
		this.btnMovePrev.Id = 7;
		this.btnMovePrev.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnMovePrev.LargeGlyph");
		this.btnMovePrev.Name = "btnMovePrev";
		this.btnMovePrev.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnMovePrev_ItemClick);
		this.btnMoveNext.Caption = "Move Next";
		this.btnMoveNext.Glyph = (System.Drawing.Image)resources.GetObject("btnMoveNext.Glyph");
		this.btnMoveNext.Id = 8;
		this.btnMoveNext.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnMoveNext.LargeGlyph");
		this.btnMoveNext.Name = "btnMoveNext";
		this.btnMoveNext.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnMoveNext_ItemClick);
		this.btnMoveLast.Caption = "Move Last";
		this.btnMoveLast.Glyph = (System.Drawing.Image)resources.GetObject("btnMoveLast.Glyph");
		this.btnMoveLast.Id = 9;
		this.btnMoveLast.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnMoveLast.LargeGlyph");
		this.btnMoveLast.Name = "btnMoveLast";
		this.btnMoveLast.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnMoveLast_ItemClick);
		this.bar3.BarName = "Status bar";
		this.bar3.CanDockStyle = DevExpress.XtraBars.BarCanDockStyle.Bottom;
		this.bar3.DockCol = 0;
		this.bar3.DockRow = 0;
		this.bar3.DockStyle = DevExpress.XtraBars.BarDockStyle.Bottom;
		this.bar3.LinksPersistInfo.AddRange(new DevExpress.XtraBars.LinkPersistInfo[1]
		{
			new DevExpress.XtraBars.LinkPersistInfo(this.lblStatus)
		});
		this.bar3.OptionsBar.AllowQuickCustomization = false;
		this.bar3.OptionsBar.DrawDragBorder = false;
		this.bar3.OptionsBar.UseWholeRow = true;
		this.bar3.Text = "Status bar";
		this.lblStatus.Caption = "lblStatus";
		this.lblStatus.Id = 4;
		this.lblStatus.Name = "lblStatus";
		this.lblStatus.TextAlignment = System.Drawing.StringAlignment.Near;
		this.barDockControlTop.CausesValidation = false;
		this.barDockControlTop.Dock = System.Windows.Forms.DockStyle.Top;
		this.barDockControlTop.Location = new System.Drawing.Point(0, 0);
		this.barDockControlTop.Size = new System.Drawing.Size(1285, 60);
		this.barDockControlBottom.CausesValidation = false;
		this.barDockControlBottom.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.barDockControlBottom.Location = new System.Drawing.Point(0, 543);
		this.barDockControlBottom.Size = new System.Drawing.Size(1285, 26);
		this.barDockControlLeft.CausesValidation = false;
		this.barDockControlLeft.Dock = System.Windows.Forms.DockStyle.Left;
		this.barDockControlLeft.Location = new System.Drawing.Point(0, 60);
		this.barDockControlLeft.Size = new System.Drawing.Size(0, 483);
		this.barDockControlRight.CausesValidation = false;
		this.barDockControlRight.Dock = System.Windows.Forms.DockStyle.Right;
		this.barDockControlRight.Location = new System.Drawing.Point(1285, 60);
		this.barDockControlRight.Size = new System.Drawing.Size(0, 483);
		this.layoutControl1.Controls.Add(this.txtTelDriver);
		this.layoutControl1.Controls.Add(this.checkEdit1);
		this.layoutControl1.Controls.Add(this.txtPartyCodeRef);
		this.layoutControl1.Controls.Add(this.gridControl1);
		this.layoutControl1.Controls.Add(this.txtAgentCodeRef);
		this.layoutControl1.Controls.Add(this.txtFaxNoRef);
		this.layoutControl1.Controls.Add(this.txtOrderDateRef);
		this.layoutControl1.Controls.Add(this.txtFirstShop);
		this.layoutControl1.Controls.Add(this.txtSeriesImport);
		this.layoutControl1.Controls.Add(this.txtKeyType);
		this.layoutControl1.Controls.Add(this.txtModifyBy);
		this.layoutControl1.Controls.Add(this.txtModifyDate);
		this.layoutControl1.Controls.Add(this.txtCreateDate);
		this.layoutControl1.Controls.Add(this.txtCreateBy);
		this.layoutControl1.Controls.Add(this.txtRemarkBook);
		this.layoutControl1.Controls.Add(this.txtPTYDateEnd);
		this.layoutControl1.Controls.Add(this.txtPTYDateStart);
		this.layoutControl1.Controls.Add(this.txtNationCode);
		this.layoutControl1.Controls.Add(this.txtDepartureDate);
		this.layoutControl1.Controls.Add(this.txtArriveDate);
		this.layoutControl1.Controls.Add(this.txtDocDate);
		this.layoutControl1.Controls.Add(this.txtDateBookTRP);
		this.layoutControl1.Controls.Add(this.txtDateBookRTH);
		this.layoutControl1.Controls.Add(this.txtDateBookBKF);
		this.layoutControl1.Controls.Add(this.txtDateBookJW);
		this.layoutControl1.Controls.Add(this.txtPax);
		this.layoutControl1.Controls.Add(this.txtTelGuide);
		this.layoutControl1.Controls.Add(this.txtTimeBookJW);
		this.layoutControl1.Controls.Add(this.txtRemark);
		this.layoutControl1.Controls.Add(this.txtCarCode);
		this.layoutControl1.Controls.Add(this.txtPartyCode);
		this.layoutControl1.Controls.Add(this.txtGuideName);
		this.layoutControl1.Controls.Add(this.txtGuideCode);
		this.layoutControl1.Controls.Add(this.txtAgentName);
		this.layoutControl1.Controls.Add(this.txtAgentCode);
		this.layoutControl1.Controls.Add(this.txtDocTime);
		this.layoutControl1.Controls.Add(this.txtDocNo);
		this.layoutControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.layoutControl1.Location = new System.Drawing.Point(0, 60);
		this.layoutControl1.Name = "layoutControl1";
		this.layoutControl1.OptionsCustomizationForm.DesignTimeCustomizationFormPositionAndSize = new System.Drawing.Rectangle(615, 52, 250, 350);
		this.layoutControl1.OptionsFocus.EnableAutoTabOrder = false;
		this.layoutControl1.Root = this.layoutControlGroup1;
		this.layoutControl1.Size = new System.Drawing.Size(1285, 483);
		this.layoutControl1.TabIndex = 4;
		this.layoutControl1.Text = "layoutControl1";
		this.txtTelDriver.EnterMoveNextControl = true;
		this.txtTelDriver.Location = new System.Drawing.Point(594, 186);
		this.txtTelDriver.MenuManager = this.barManager1;
		this.txtTelDriver.Name = "txtTelDriver";
		this.txtTelDriver.Size = new System.Drawing.Size(180, 20);
		this.txtTelDriver.StyleController = this.layoutControl1;
		this.txtTelDriver.TabIndex = 112;
		this.checkEdit1.Location = new System.Drawing.Point(24, 43);
		this.checkEdit1.MenuManager = this.barManager1;
		this.checkEdit1.Name = "checkEdit1";
		this.checkEdit1.Properties.Caption = "Complete";
		this.checkEdit1.Size = new System.Drawing.Size(750, 19);
		this.checkEdit1.StyleController = this.layoutControl1;
		this.checkEdit1.TabIndex = 39;
		this.txtPartyCodeRef.Location = new System.Drawing.Point(1112, 67);
		this.txtPartyCodeRef.MenuManager = this.barManager1;
		this.txtPartyCodeRef.Name = "txtPartyCodeRef";
		this.txtPartyCodeRef.Properties.ReadOnly = true;
		this.txtPartyCodeRef.Size = new System.Drawing.Size(149, 20);
		this.txtPartyCodeRef.StyleController = this.layoutControl1;
		this.txtPartyCodeRef.TabIndex = 23;
		this.gridControl1.Location = new System.Drawing.Point(802, 115);
		this.gridControl1.MainView = this.gridView1;
		this.gridControl1.MenuManager = this.barManager1;
		this.gridControl1.Name = "gridControl1";
		this.gridControl1.Size = new System.Drawing.Size(459, 206);
		this.gridControl1.TabIndex = 37;
		this.gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView1 });
		this.gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[7] { this.gridColumn1, this.gridColumn2, this.gridColumn3, this.gridColumn4, this.gridColumn5, this.gridColumn6, this.gridColumn7 });
		this.gridView1.GridControl = this.gridControl1;
		this.gridView1.Name = "gridView1";
		this.gridView1.OptionsBehavior.Editable = false;
		this.gridView1.OptionsCustomization.AllowColumnMoving = false;
		this.gridView1.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView1.OptionsView.ShowGroupPanel = false;
		this.gridColumn1.Caption = "Order Date";
		this.gridColumn1.FieldName = "Order_Date";
		this.gridColumn1.Name = "gridColumn1";
		this.gridColumn1.Visible = true;
		this.gridColumn1.VisibleIndex = 0;
		this.gridColumn2.Caption = "Fax No";
		this.gridColumn2.FieldName = "Fax_No";
		this.gridColumn2.Name = "gridColumn2";
		this.gridColumn2.Visible = true;
		this.gridColumn2.VisibleIndex = 1;
		this.gridColumn3.Caption = "Agent Code";
		this.gridColumn3.FieldName = "Agent_Code";
		this.gridColumn3.Name = "gridColumn3";
		this.gridColumn3.Visible = true;
		this.gridColumn3.VisibleIndex = 2;
		this.gridColumn4.Caption = "Code";
		this.gridColumn4.FieldName = "Code";
		this.gridColumn4.Name = "gridColumn4";
		this.gridColumn4.Visible = true;
		this.gridColumn4.VisibleIndex = 3;
		this.gridColumn5.Caption = "Place";
		this.gridColumn5.FieldName = "Place_Code";
		this.gridColumn5.Name = "gridColumn5";
		this.gridColumn5.Visible = true;
		this.gridColumn5.VisibleIndex = 4;
		this.gridColumn6.Caption = "Start Date";
		this.gridColumn6.FieldName = "Start_Date";
		this.gridColumn6.Name = "gridColumn6";
		this.gridColumn6.Visible = true;
		this.gridColumn6.VisibleIndex = 5;
		this.gridColumn7.Caption = "End Date";
		this.gridColumn7.FieldName = "End_Date";
		this.gridColumn7.Name = "gridColumn7";
		this.gridColumn7.Visible = true;
		this.gridColumn7.VisibleIndex = 6;
		this.txtAgentCodeRef.Location = new System.Drawing.Point(1112, 43);
		this.txtAgentCodeRef.MenuManager = this.barManager1;
		this.txtAgentCodeRef.Name = "txtAgentCodeRef";
		this.txtAgentCodeRef.Properties.ReadOnly = true;
		this.txtAgentCodeRef.Size = new System.Drawing.Size(149, 20);
		this.txtAgentCodeRef.StyleController = this.layoutControl1;
		this.txtAgentCodeRef.TabIndex = 21;
		this.txtFaxNoRef.Location = new System.Drawing.Point(880, 67);
		this.txtFaxNoRef.MenuManager = this.barManager1;
		this.txtFaxNoRef.Name = "txtFaxNoRef";
		this.txtFaxNoRef.Properties.ReadOnly = true;
		this.txtFaxNoRef.Size = new System.Drawing.Size(150, 20);
		this.txtFaxNoRef.StyleController = this.layoutControl1;
		this.txtFaxNoRef.TabIndex = 22;
		this.txtOrderDateRef.Location = new System.Drawing.Point(880, 43);
		this.txtOrderDateRef.MenuManager = this.barManager1;
		this.txtOrderDateRef.Name = "txtOrderDateRef";
		this.txtOrderDateRef.Properties.ReadOnly = true;
		this.txtOrderDateRef.Size = new System.Drawing.Size(150, 20);
		this.txtOrderDateRef.StyleController = this.layoutControl1;
		this.txtOrderDateRef.TabIndex = 20;
		this.txtFirstShop.EnterMoveNextControl = true;
		this.txtFirstShop.Location = new System.Drawing.Point(330, 138);
		this.txtFirstShop.MenuManager = this.barManager1;
		this.txtFirstShop.Name = "txtFirstShop";
		this.txtFirstShop.Properties.AllowNullInput = DevExpress.Utils.DefaultBoolean.True;
		this.txtFirstShop.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtFirstShop.Properties.NullText = "[Select First Shop]";
		this.txtFirstShop.Size = new System.Drawing.Size(180, 20);
		this.txtFirstShop.StyleController = this.layoutControl1;
		this.txtFirstShop.TabIndex = 106;
		this.txtSeriesImport.Location = new System.Drawing.Point(1118, 416);
		this.txtSeriesImport.MenuManager = this.barManager1;
		this.txtSeriesImport.Name = "txtSeriesImport";
		this.txtSeriesImport.Properties.ReadOnly = true;
		this.txtSeriesImport.Size = new System.Drawing.Size(143, 20);
		this.txtSeriesImport.StyleController = this.layoutControl1;
		this.txtSeriesImport.TabIndex = 30;
		this.txtKeyType.Location = new System.Drawing.Point(880, 416);
		this.txtKeyType.MenuManager = this.barManager1;
		this.txtKeyType.Name = "txtKeyType";
		this.txtKeyType.Properties.ReadOnly = true;
		this.txtKeyType.Size = new System.Drawing.Size(156, 20);
		this.txtKeyType.StyleController = this.layoutControl1;
		this.txtKeyType.TabIndex = 29;
		this.txtModifyBy.Location = new System.Drawing.Point(1118, 392);
		this.txtModifyBy.MenuManager = this.barManager1;
		this.txtModifyBy.Name = "txtModifyBy";
		this.txtModifyBy.Properties.ReadOnly = true;
		this.txtModifyBy.Size = new System.Drawing.Size(143, 20);
		this.txtModifyBy.StyleController = this.layoutControl1;
		this.txtModifyBy.TabIndex = 28;
		this.txtModifyDate.Location = new System.Drawing.Point(880, 392);
		this.txtModifyDate.MenuManager = this.barManager1;
		this.txtModifyDate.Name = "txtModifyDate";
		this.txtModifyDate.Properties.ReadOnly = true;
		this.txtModifyDate.Size = new System.Drawing.Size(156, 20);
		this.txtModifyDate.StyleController = this.layoutControl1;
		this.txtModifyDate.TabIndex = 27;
		this.txtCreateDate.Location = new System.Drawing.Point(880, 368);
		this.txtCreateDate.MenuManager = this.barManager1;
		this.txtCreateDate.Name = "txtCreateDate";
		this.txtCreateDate.Properties.ReadOnly = true;
		this.txtCreateDate.Size = new System.Drawing.Size(156, 20);
		this.txtCreateDate.StyleController = this.layoutControl1;
		this.txtCreateDate.TabIndex = 25;
		this.txtCreateBy.Location = new System.Drawing.Point(1118, 368);
		this.txtCreateBy.MenuManager = this.barManager1;
		this.txtCreateBy.Name = "txtCreateBy";
		this.txtCreateBy.Properties.ReadOnly = true;
		this.txtCreateBy.Size = new System.Drawing.Size(143, 20);
		this.txtCreateBy.StyleController = this.layoutControl1;
		this.txtCreateBy.TabIndex = 26;
		this.txtRemarkBook.Location = new System.Drawing.Point(880, 91);
		this.txtRemarkBook.MenuManager = this.barManager1;
		this.txtRemarkBook.Name = "txtRemarkBook";
		this.txtRemarkBook.Properties.ReadOnly = true;
		this.txtRemarkBook.Size = new System.Drawing.Size(381, 20);
		this.txtRemarkBook.StyleController = this.layoutControl1;
		this.txtRemarkBook.TabIndex = 24;
		this.txtPTYDateEnd.EditValue = null;
		this.txtPTYDateEnd.EnterMoveNextControl = true;
		this.txtPTYDateEnd.Location = new System.Drawing.Point(491, 301);
		this.txtPTYDateEnd.MenuManager = this.barManager1;
		this.txtPTYDateEnd.Name = "txtPTYDateEnd";
		this.txtPTYDateEnd.Properties.AllowNullInput = DevExpress.Utils.DefaultBoolean.True;
		this.txtPTYDateEnd.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtPTYDateEnd.Properties.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtPTYDateEnd.Size = new System.Drawing.Size(283, 20);
		this.txtPTYDateEnd.StyleController = this.layoutControl1;
		this.txtPTYDateEnd.TabIndex = 117;
		this.txtPTYDateStart.EditValue = null;
		this.txtPTYDateStart.EnterMoveNextControl = true;
		this.txtPTYDateStart.Location = new System.Drawing.Point(491, 277);
		this.txtPTYDateStart.MenuManager = this.barManager1;
		this.txtPTYDateStart.Name = "txtPTYDateStart";
		this.txtPTYDateStart.Properties.AllowNullInput = DevExpress.Utils.DefaultBoolean.True;
		this.txtPTYDateStart.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtPTYDateStart.Properties.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtPTYDateStart.Size = new System.Drawing.Size(283, 20);
		this.txtPTYDateStart.StyleController = this.layoutControl1;
		this.txtPTYDateStart.TabIndex = 116;
		this.txtNationCode.EnterMoveNextControl = true;
		this.txtNationCode.Location = new System.Drawing.Point(102, 138);
		this.txtNationCode.MenuManager = this.barManager1;
		this.txtNationCode.Name = "txtNationCode";
		this.txtNationCode.Size = new System.Drawing.Size(146, 20);
		this.txtNationCode.StyleController = this.layoutControl1;
		this.txtNationCode.TabIndex = 105;
		this.txtNationCode.KeyDown += new System.Windows.Forms.KeyEventHandler(txtNationCode_KeyDown);
		this.txtDepartureDate.EditValue = null;
		this.txtDepartureDate.EnterMoveNextControl = true;
		this.txtDepartureDate.Location = new System.Drawing.Point(592, 114);
		this.txtDepartureDate.MenuManager = this.barManager1;
		this.txtDepartureDate.Name = "txtDepartureDate";
		this.txtDepartureDate.Properties.AllowNullInput = DevExpress.Utils.DefaultBoolean.True;
		this.txtDepartureDate.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDepartureDate.Properties.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDepartureDate.Size = new System.Drawing.Size(182, 20);
		this.txtDepartureDate.StyleController = this.layoutControl1;
		this.txtDepartureDate.TabIndex = 104;
		this.txtArriveDate.EditValue = null;
		this.txtArriveDate.EnterMoveNextControl = true;
		this.txtArriveDate.Location = new System.Drawing.Point(330, 114);
		this.txtArriveDate.MenuManager = this.barManager1;
		this.txtArriveDate.Name = "txtArriveDate";
		this.txtArriveDate.Properties.AllowNullInput = DevExpress.Utils.DefaultBoolean.True;
		this.txtArriveDate.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtArriveDate.Properties.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtArriveDate.Size = new System.Drawing.Size(180, 20);
		this.txtArriveDate.StyleController = this.layoutControl1;
		this.txtArriveDate.TabIndex = 103;
		this.txtDocDate.EditValue = null;
		this.txtDocDate.Location = new System.Drawing.Point(102, 66);
		this.txtDocDate.MenuManager = this.barManager1;
		this.txtDocDate.Name = "txtDocDate";
		this.txtDocDate.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDocDate.Properties.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDocDate.Properties.ReadOnly = true;
		this.txtDocDate.Size = new System.Drawing.Size(146, 20);
		this.txtDocDate.StyleController = this.layoutControl1;
		this.txtDocDate.TabIndex = 0;
		this.txtDateBookTRP.EditValue = null;
		this.txtDateBookTRP.EnterMoveNextControl = true;
		this.txtDateBookTRP.Location = new System.Drawing.Point(604, 368);
		this.txtDateBookTRP.MenuManager = this.barManager1;
		this.txtDateBookTRP.Name = "txtDateBookTRP";
		this.txtDateBookTRP.Properties.AllowNullInput = DevExpress.Utils.DefaultBoolean.True;
		this.txtDateBookTRP.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDateBookTRP.Properties.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDateBookTRP.Size = new System.Drawing.Size(170, 20);
		this.txtDateBookTRP.StyleController = this.layoutControl1;
		this.txtDateBookTRP.TabIndex = 117;
		this.txtDateBookRTH.EditValue = null;
		this.txtDateBookRTH.EnterMoveNextControl = true;
		this.txtDateBookRTH.Location = new System.Drawing.Point(102, 368);
		this.txtDateBookRTH.MenuManager = this.barManager1;
		this.txtDateBookRTH.Name = "txtDateBookRTH";
		this.txtDateBookRTH.Properties.AllowNullInput = DevExpress.Utils.DefaultBoolean.True;
		this.txtDateBookRTH.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDateBookRTH.Properties.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDateBookRTH.Size = new System.Drawing.Size(164, 20);
		this.txtDateBookRTH.StyleController = this.layoutControl1;
		this.txtDateBookRTH.TabIndex = 116;
		this.txtDateBookBKF.EditValue = null;
		this.txtDateBookBKF.EnterMoveNextControl = true;
		this.txtDateBookBKF.Location = new System.Drawing.Point(348, 368);
		this.txtDateBookBKF.MenuManager = this.barManager1;
		this.txtDateBookBKF.Name = "txtDateBookBKF";
		this.txtDateBookBKF.Properties.AllowNullInput = DevExpress.Utils.DefaultBoolean.True;
		this.txtDateBookBKF.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDateBookBKF.Properties.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDateBookBKF.Size = new System.Drawing.Size(174, 20);
		this.txtDateBookBKF.StyleController = this.layoutControl1;
		this.txtDateBookBKF.TabIndex = 115;
		this.txtDateBookJW.EditValue = null;
		this.txtDateBookJW.EnterMoveNextControl = true;
		this.txtDateBookJW.Location = new System.Drawing.Point(102, 277);
		this.txtDateBookJW.MenuManager = this.barManager1;
		this.txtDateBookJW.Name = "txtDateBookJW";
		this.txtDateBookJW.Properties.AllowNullInput = DevExpress.Utils.DefaultBoolean.True;
		this.txtDateBookJW.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDateBookJW.Properties.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtDateBookJW.Size = new System.Drawing.Size(283, 20);
		this.txtDateBookJW.StyleController = this.layoutControl1;
		this.txtDateBookJW.TabIndex = 114;
		this.txtPax.EditValue = new decimal(new int[4]);
		this.txtPax.EnterMoveNextControl = true;
		this.txtPax.Location = new System.Drawing.Point(592, 138);
		this.txtPax.MenuManager = this.barManager1;
		this.txtPax.Name = "txtPax";
		this.txtPax.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.txtPax.Size = new System.Drawing.Size(182, 20);
		this.txtPax.StyleController = this.layoutControl1;
		this.txtPax.TabIndex = 107;
		this.txtTelGuide.EnterMoveNextControl = true;
		this.txtTelGuide.Location = new System.Drawing.Point(102, 186);
		this.txtTelGuide.MenuManager = this.barManager1;
		this.txtTelGuide.Name = "txtTelGuide";
		this.txtTelGuide.Size = new System.Drawing.Size(146, 20);
		this.txtTelGuide.StyleController = this.layoutControl1;
		this.txtTelGuide.TabIndex = 110;
		this.txtTimeBookJW.EnterMoveNextControl = true;
		this.txtTimeBookJW.Location = new System.Drawing.Point(102, 301);
		this.txtTimeBookJW.MenuManager = this.barManager1;
		this.txtTimeBookJW.Name = "txtTimeBookJW";
		this.txtTimeBookJW.Properties.Mask.EditMask = "90:00";
		this.txtTimeBookJW.Properties.Mask.MaskType = DevExpress.XtraEditors.Mask.MaskType.Simple;
		this.txtTimeBookJW.Size = new System.Drawing.Size(283, 20);
		this.txtTimeBookJW.StyleController = this.layoutControl1;
		this.txtTimeBookJW.TabIndex = 115;
		this.txtRemark.EnterMoveNextControl = true;
		this.txtRemark.Location = new System.Drawing.Point(102, 210);
		this.txtRemark.MenuManager = this.barManager1;
		this.txtRemark.Name = "txtRemark";
		this.txtRemark.Size = new System.Drawing.Size(672, 20);
		this.txtRemark.StyleController = this.layoutControl1;
		this.txtRemark.TabIndex = 113;
		this.txtRemark.KeyDown += new System.Windows.Forms.KeyEventHandler(txtRemark_KeyDown);
		this.txtCarCode.EnterMoveNextControl = true;
		this.txtCarCode.Location = new System.Drawing.Point(330, 186);
		this.txtCarCode.MenuManager = this.barManager1;
		this.txtCarCode.Name = "txtCarCode";
		this.txtCarCode.Size = new System.Drawing.Size(182, 20);
		this.txtCarCode.StyleController = this.layoutControl1;
		this.txtCarCode.TabIndex = 111;
		this.txtPartyCode.EnterMoveNextControl = true;
		this.txtPartyCode.Location = new System.Drawing.Point(102, 114);
		this.txtPartyCode.MenuManager = this.barManager1;
		this.txtPartyCode.Name = "txtPartyCode";
		this.txtPartyCode.Size = new System.Drawing.Size(146, 20);
		this.txtPartyCode.StyleController = this.layoutControl1;
		this.txtPartyCode.TabIndex = 102;
		this.txtPartyCode.KeyDown += new System.Windows.Forms.KeyEventHandler(txtPartyCode_KeyDown);
		this.txtGuideName.EnterMoveNextControl = true;
		this.txtGuideName.Location = new System.Drawing.Point(330, 162);
		this.txtGuideName.MenuManager = this.barManager1;
		this.txtGuideName.Name = "txtGuideName";
		this.txtGuideName.Size = new System.Drawing.Size(444, 20);
		this.txtGuideName.StyleController = this.layoutControl1;
		this.txtGuideName.TabIndex = 109;
		this.txtGuideCode.EnterMoveNextControl = true;
		this.txtGuideCode.Location = new System.Drawing.Point(102, 162);
		this.txtGuideCode.MenuManager = this.barManager1;
		this.txtGuideCode.Name = "txtGuideCode";
		this.txtGuideCode.Size = new System.Drawing.Size(146, 20);
		this.txtGuideCode.StyleController = this.layoutControl1;
		this.txtGuideCode.TabIndex = 108;
		this.txtGuideCode.KeyDown += new System.Windows.Forms.KeyEventHandler(txtGuideCode_KeyDown);
		this.txtAgentName.EnterMoveNextControl = true;
		this.txtAgentName.Location = new System.Drawing.Point(330, 90);
		this.txtAgentName.MenuManager = this.barManager1;
		this.txtAgentName.Name = "txtAgentName";
		this.txtAgentName.Size = new System.Drawing.Size(444, 20);
		this.txtAgentName.StyleController = this.layoutControl1;
		this.txtAgentName.TabIndex = 101;
		this.txtAgentCode.EnterMoveNextControl = true;
		this.txtAgentCode.Location = new System.Drawing.Point(102, 90);
		this.txtAgentCode.MenuManager = this.barManager1;
		this.txtAgentCode.Name = "txtAgentCode";
		this.txtAgentCode.Size = new System.Drawing.Size(146, 20);
		this.txtAgentCode.StyleController = this.layoutControl1;
		this.txtAgentCode.TabIndex = 100;
		this.txtAgentCode.KeyDown += new System.Windows.Forms.KeyEventHandler(txtAgentCode_KeyDown);
		this.txtDocTime.Location = new System.Drawing.Point(330, 66);
		this.txtDocTime.MenuManager = this.barManager1;
		this.txtDocTime.Name = "txtDocTime";
		this.txtDocTime.Properties.ReadOnly = true;
		this.txtDocTime.Size = new System.Drawing.Size(180, 20);
		this.txtDocTime.StyleController = this.layoutControl1;
		this.txtDocTime.TabIndex = 1;
		this.txtDocNo.Location = new System.Drawing.Point(592, 66);
		this.txtDocNo.MenuManager = this.barManager1;
		this.txtDocNo.Name = "txtDocNo";
		this.txtDocNo.Properties.ReadOnly = true;
		this.txtDocNo.Size = new System.Drawing.Size(182, 20);
		this.txtDocNo.StyleController = this.layoutControl1;
		this.txtDocNo.TabIndex = 2;
		this.layoutControlGroup1.EnableIndentsWithoutBorders = DevExpress.Utils.DefaultBoolean.True;
		this.layoutControlGroup1.GroupBordersVisible = false;
		this.layoutControlGroup1.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[9] { this.layoutControlGroup2, this.layoutControlGroup4, this.emptySpaceItem1, this.layoutControlGroup8, this.layoutControlGroup7, this.emptySpaceItem2, this.layoutControlGroup9, this.layoutControlGroup6, this.emptySpaceItem3 });
		this.layoutControlGroup1.Location = new System.Drawing.Point(0, 0);
		this.layoutControlGroup1.Name = "Root";
		this.layoutControlGroup1.Size = new System.Drawing.Size(1285, 483);
		this.layoutControlGroup1.TextVisible = false;
		this.layoutControlGroup2.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[2] { this.layoutControlItem10, this.layoutControlItem17 });
		this.layoutControlGroup2.Location = new System.Drawing.Point(0, 234);
		this.layoutControlGroup2.Name = "layoutControlGroup2";
		this.layoutControlGroup2.Size = new System.Drawing.Size(389, 91);
		this.layoutControlGroup2.Text = "Book";
		this.layoutControlItem10.Control = this.txtDateBookJW;
		this.layoutControlItem10.Location = new System.Drawing.Point(0, 0);
		this.layoutControlItem10.Name = "layoutControlItem10";
		this.layoutControlItem10.Size = new System.Drawing.Size(365, 24);
		this.layoutControlItem10.Text = "Date";
		this.layoutControlItem10.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem17.Control = this.txtTimeBookJW;
		this.layoutControlItem17.Location = new System.Drawing.Point(0, 24);
		this.layoutControlItem17.Name = "layoutControlItem17";
		this.layoutControlItem17.Size = new System.Drawing.Size(365, 24);
		this.layoutControlItem17.Text = "Time";
		this.layoutControlItem17.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlGroup4.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[3] { this.layoutControlItem23, this.layoutControlItem22, this.layoutControlItem24 });
		this.layoutControlGroup4.Location = new System.Drawing.Point(0, 325);
		this.layoutControlGroup4.Name = "layoutControlGroup4";
		this.layoutControlGroup4.Size = new System.Drawing.Size(778, 67);
		this.layoutControlGroup4.Text = "Book Other";
		this.layoutControlGroup4.Visibility = DevExpress.XtraLayout.Utils.LayoutVisibility.Never;
		this.layoutControlItem23.Control = this.txtDateBookRTH;
		this.layoutControlItem23.Location = new System.Drawing.Point(0, 0);
		this.layoutControlItem23.Name = "layoutControlItem23";
		this.layoutControlItem23.Size = new System.Drawing.Size(246, 24);
		this.layoutControlItem23.Text = "Date";
		this.layoutControlItem23.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem22.Control = this.txtDateBookBKF;
		this.layoutControlItem22.Location = new System.Drawing.Point(246, 0);
		this.layoutControlItem22.Name = "layoutControlItem22";
		this.layoutControlItem22.Size = new System.Drawing.Size(256, 24);
		this.layoutControlItem22.Text = "Date";
		this.layoutControlItem22.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem24.Control = this.txtDateBookTRP;
		this.layoutControlItem24.Location = new System.Drawing.Point(502, 0);
		this.layoutControlItem24.Name = "layoutControlItem24";
		this.layoutControlItem24.Size = new System.Drawing.Size(252, 24);
		this.layoutControlItem24.Text = "Date";
		this.layoutControlItem24.TextSize = new System.Drawing.Size(75, 13);
		this.emptySpaceItem1.AllowHotTrack = false;
		this.emptySpaceItem1.Location = new System.Drawing.Point(778, 440);
		this.emptySpaceItem1.Name = "emptySpaceItem1";
		this.emptySpaceItem1.Size = new System.Drawing.Size(487, 13);
		this.emptySpaceItem1.TextSize = new System.Drawing.Size(0, 0);
		this.layoutControlGroup8.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[6] { this.layoutControlItem34, this.layoutControlItem26, this.layoutControlItem36, this.layoutControlItem37, this.layoutControlItem38, this.layoutControlItem35 });
		this.layoutControlGroup8.Location = new System.Drawing.Point(778, 0);
		this.layoutControlGroup8.Name = "layoutControlGroup8";
		this.layoutControlGroup8.Size = new System.Drawing.Size(487, 325);
		this.layoutControlGroup8.Text = "Booking Reference";
		this.layoutControlItem34.Control = this.txtOrderDateRef;
		this.layoutControlItem34.Location = new System.Drawing.Point(0, 0);
		this.layoutControlItem34.Name = "layoutControlItem34";
		this.layoutControlItem34.Size = new System.Drawing.Size(232, 24);
		this.layoutControlItem34.Text = "Order Date";
		this.layoutControlItem34.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem26.Control = this.txtRemarkBook;
		this.layoutControlItem26.Location = new System.Drawing.Point(0, 48);
		this.layoutControlItem26.Name = "layoutControlItem26";
		this.layoutControlItem26.Size = new System.Drawing.Size(463, 24);
		this.layoutControlItem26.Text = "Book Remark";
		this.layoutControlItem26.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem36.Control = this.txtAgentCodeRef;
		this.layoutControlItem36.Location = new System.Drawing.Point(232, 0);
		this.layoutControlItem36.Name = "layoutControlItem36";
		this.layoutControlItem36.Size = new System.Drawing.Size(231, 24);
		this.layoutControlItem36.Text = "Agent Ref";
		this.layoutControlItem36.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem37.Control = this.gridControl1;
		this.layoutControlItem37.Location = new System.Drawing.Point(0, 72);
		this.layoutControlItem37.Name = "layoutControlItem37";
		this.layoutControlItem37.Size = new System.Drawing.Size(463, 210);
		this.layoutControlItem37.TextSize = new System.Drawing.Size(0, 0);
		this.layoutControlItem37.TextVisible = false;
		this.layoutControlItem38.Control = this.txtPartyCodeRef;
		this.layoutControlItem38.Location = new System.Drawing.Point(232, 24);
		this.layoutControlItem38.Name = "layoutControlItem38";
		this.layoutControlItem38.Size = new System.Drawing.Size(231, 24);
		this.layoutControlItem38.Text = "PartyCode Ref";
		this.layoutControlItem38.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem35.Control = this.txtFaxNoRef;
		this.layoutControlItem35.Location = new System.Drawing.Point(0, 24);
		this.layoutControlItem35.Name = "layoutControlItem35";
		this.layoutControlItem35.Size = new System.Drawing.Size(232, 24);
		this.layoutControlItem35.Text = "Fax No";
		this.layoutControlItem35.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlGroup7.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[6] { this.layoutControlItem28, this.layoutControlItem29, this.layoutControlItem27, this.layoutControlItem30, this.layoutControlItem32, this.layoutControlItem31 });
		this.layoutControlGroup7.Location = new System.Drawing.Point(778, 325);
		this.layoutControlGroup7.Name = "layoutControlGroup7";
		this.layoutControlGroup7.Size = new System.Drawing.Size(487, 115);
		this.layoutControlGroup7.Text = "System";
		this.layoutControlItem28.Control = this.txtCreateDate;
		this.layoutControlItem28.Location = new System.Drawing.Point(0, 0);
		this.layoutControlItem28.Name = "layoutControlItem28";
		this.layoutControlItem28.Size = new System.Drawing.Size(238, 24);
		this.layoutControlItem28.Text = "Create Date";
		this.layoutControlItem28.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem29.Control = this.txtModifyDate;
		this.layoutControlItem29.Location = new System.Drawing.Point(0, 24);
		this.layoutControlItem29.Name = "layoutControlItem29";
		this.layoutControlItem29.Size = new System.Drawing.Size(238, 24);
		this.layoutControlItem29.Text = "Modify Date";
		this.layoutControlItem29.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem27.Control = this.txtCreateBy;
		this.layoutControlItem27.Location = new System.Drawing.Point(238, 0);
		this.layoutControlItem27.Name = "layoutControlItem27";
		this.layoutControlItem27.Size = new System.Drawing.Size(225, 24);
		this.layoutControlItem27.Text = "Create By";
		this.layoutControlItem27.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem30.Control = this.txtModifyBy;
		this.layoutControlItem30.Location = new System.Drawing.Point(238, 24);
		this.layoutControlItem30.Name = "layoutControlItem30";
		this.layoutControlItem30.Size = new System.Drawing.Size(225, 24);
		this.layoutControlItem30.Text = "Modify By";
		this.layoutControlItem30.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem32.Control = this.txtSeriesImport;
		this.layoutControlItem32.Location = new System.Drawing.Point(238, 48);
		this.layoutControlItem32.Name = "layoutControlItem32";
		this.layoutControlItem32.Size = new System.Drawing.Size(225, 24);
		this.layoutControlItem32.Text = "Series Import";
		this.layoutControlItem32.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem31.Control = this.txtKeyType;
		this.layoutControlItem31.Location = new System.Drawing.Point(0, 48);
		this.layoutControlItem31.Name = "layoutControlItem31";
		this.layoutControlItem31.Size = new System.Drawing.Size(238, 24);
		this.layoutControlItem31.Text = "Key Type";
		this.layoutControlItem31.TextSize = new System.Drawing.Size(75, 13);
		this.emptySpaceItem2.AllowHotTrack = false;
		this.emptySpaceItem2.Location = new System.Drawing.Point(0, 453);
		this.emptySpaceItem2.Name = "emptySpaceItem2";
		this.emptySpaceItem2.Size = new System.Drawing.Size(1265, 10);
		this.emptySpaceItem2.TextSize = new System.Drawing.Size(0, 0);
		this.layoutControlGroup9.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[18]
		{
			this.layoutControlItem13, this.layoutControlItem3, this.layoutControlItem2, this.layoutControlItem4, this.layoutControlItem5, this.layoutControlItem9, this.layoutControlItem6, this.layoutControlItem7, this.layoutControlItem21, this.layoutControlItem11,
			this.layoutControlItem12, this.layoutControlItem18, this.layoutControlItem14, this.layoutControlItem15, this.layoutControlItem1, this.layoutControlItem33, this.layoutControlItem8, this.layoutControlItem19
		});
		this.layoutControlGroup9.Location = new System.Drawing.Point(0, 0);
		this.layoutControlGroup9.Name = "layoutControlGroup9";
		this.layoutControlGroup9.Size = new System.Drawing.Size(778, 234);
		this.layoutControlGroup9.Text = "General";
		this.layoutControlItem13.Control = this.txtDocDate;
		this.layoutControlItem13.Location = new System.Drawing.Point(0, 23);
		this.layoutControlItem13.Name = "layoutControlItem13";
		this.layoutControlItem13.Size = new System.Drawing.Size(228, 24);
		this.layoutControlItem13.Text = "Date";
		this.layoutControlItem13.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem3.Control = this.txtDocTime;
		this.layoutControlItem3.Location = new System.Drawing.Point(228, 23);
		this.layoutControlItem3.Name = "layoutControlItem3";
		this.layoutControlItem3.Size = new System.Drawing.Size(262, 24);
		this.layoutControlItem3.Text = "Doc Time";
		this.layoutControlItem3.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem2.Control = this.txtDocNo;
		this.layoutControlItem2.Location = new System.Drawing.Point(490, 23);
		this.layoutControlItem2.Name = "layoutControlItem2";
		this.layoutControlItem2.Size = new System.Drawing.Size(264, 24);
		this.layoutControlItem2.Text = "Doc No";
		this.layoutControlItem2.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem4.Control = this.txtAgentCode;
		this.layoutControlItem4.Location = new System.Drawing.Point(0, 47);
		this.layoutControlItem4.Name = "layoutControlItem4";
		this.layoutControlItem4.Size = new System.Drawing.Size(228, 24);
		this.layoutControlItem4.Text = "รห\u0e31ส Agent";
		this.layoutControlItem4.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem5.Control = this.txtAgentName;
		this.layoutControlItem5.Location = new System.Drawing.Point(228, 47);
		this.layoutControlItem5.Name = "layoutControlItem5";
		this.layoutControlItem5.Size = new System.Drawing.Size(526, 24);
		this.layoutControlItem5.Text = "ช\u0e37\u0e48อ Agent";
		this.layoutControlItem5.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem9.Control = this.txtPartyCode;
		this.layoutControlItem9.Location = new System.Drawing.Point(0, 71);
		this.layoutControlItem9.Name = "layoutControlItem9";
		this.layoutControlItem9.Size = new System.Drawing.Size(228, 24);
		this.layoutControlItem9.Text = "PartyCode";
		this.layoutControlItem9.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem6.Control = this.txtGuideCode;
		this.layoutControlItem6.Location = new System.Drawing.Point(0, 119);
		this.layoutControlItem6.Name = "layoutControlItem6";
		this.layoutControlItem6.Size = new System.Drawing.Size(228, 24);
		this.layoutControlItem6.Text = "รห\u0e31ส Guide";
		this.layoutControlItem6.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem7.Control = this.txtGuideName;
		this.layoutControlItem7.Location = new System.Drawing.Point(228, 119);
		this.layoutControlItem7.Name = "layoutControlItem7";
		this.layoutControlItem7.Size = new System.Drawing.Size(526, 24);
		this.layoutControlItem7.Text = "ช\u0e37\u0e48อ Guide";
		this.layoutControlItem7.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem21.Control = this.txtTelGuide;
		this.layoutControlItem21.Location = new System.Drawing.Point(0, 143);
		this.layoutControlItem21.Name = "layoutControlItem21";
		this.layoutControlItem21.Size = new System.Drawing.Size(228, 24);
		this.layoutControlItem21.Text = "Tel Guide";
		this.layoutControlItem21.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem11.Control = this.txtCarCode;
		this.layoutControlItem11.Location = new System.Drawing.Point(228, 143);
		this.layoutControlItem11.Name = "layoutControlItem11";
		this.layoutControlItem11.Size = new System.Drawing.Size(264, 24);
		this.layoutControlItem11.Text = "ทะเบ\u0e35ยนรถ";
		this.layoutControlItem11.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem12.Control = this.txtRemark;
		this.layoutControlItem12.Location = new System.Drawing.Point(0, 167);
		this.layoutControlItem12.Name = "layoutControlItem12";
		this.layoutControlItem12.Size = new System.Drawing.Size(754, 24);
		this.layoutControlItem12.Text = "หมายเหต\u0e38";
		this.layoutControlItem12.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem18.Control = this.checkEdit1;
		this.layoutControlItem18.Location = new System.Drawing.Point(0, 0);
		this.layoutControlItem18.Name = "layoutControlItem18";
		this.layoutControlItem18.Size = new System.Drawing.Size(754, 23);
		this.layoutControlItem18.TextSize = new System.Drawing.Size(0, 0);
		this.layoutControlItem18.TextVisible = false;
		this.layoutControlItem14.Control = this.txtDepartureDate;
		this.layoutControlItem14.Location = new System.Drawing.Point(490, 71);
		this.layoutControlItem14.Name = "layoutControlItem14";
		this.layoutControlItem14.Size = new System.Drawing.Size(264, 24);
		this.layoutControlItem14.Text = "Departure Date";
		this.layoutControlItem14.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem15.Control = this.txtNationCode;
		this.layoutControlItem15.Location = new System.Drawing.Point(0, 95);
		this.layoutControlItem15.Name = "layoutControlItem15";
		this.layoutControlItem15.Size = new System.Drawing.Size(228, 24);
		this.layoutControlItem15.Text = "ชนชาต\u0e34";
		this.layoutControlItem15.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem1.Control = this.txtArriveDate;
		this.layoutControlItem1.Location = new System.Drawing.Point(228, 71);
		this.layoutControlItem1.Name = "layoutControlItem1";
		this.layoutControlItem1.Size = new System.Drawing.Size(262, 24);
		this.layoutControlItem1.Text = "Arrive Date";
		this.layoutControlItem1.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem33.Control = this.txtFirstShop;
		this.layoutControlItem33.Location = new System.Drawing.Point(228, 95);
		this.layoutControlItem33.Name = "layoutControlItem33";
		this.layoutControlItem33.Size = new System.Drawing.Size(262, 24);
		this.layoutControlItem33.Text = "First Shop";
		this.layoutControlItem33.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem8.Control = this.txtPax;
		this.layoutControlItem8.Location = new System.Drawing.Point(490, 95);
		this.layoutControlItem8.Name = "layoutControlItem8";
		this.layoutControlItem8.Size = new System.Drawing.Size(264, 24);
		this.layoutControlItem8.Text = "Pax";
		this.layoutControlItem8.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem19.Control = this.txtTelDriver;
		this.layoutControlItem19.Location = new System.Drawing.Point(492, 143);
		this.layoutControlItem19.Name = "layoutControlItem19";
		this.layoutControlItem19.Size = new System.Drawing.Size(262, 24);
		this.layoutControlItem19.Text = "Tel พขร.";
		this.layoutControlItem19.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlGroup6.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[2] { this.layoutControlItem16, this.layoutControlItem25 });
		this.layoutControlGroup6.Location = new System.Drawing.Point(389, 234);
		this.layoutControlGroup6.Name = "layoutControlGroup6";
		this.layoutControlGroup6.Size = new System.Drawing.Size(389, 91);
		this.layoutControlGroup6.Text = "Book PTY";
		this.layoutControlItem16.Control = this.txtPTYDateStart;
		this.layoutControlItem16.Location = new System.Drawing.Point(0, 0);
		this.layoutControlItem16.Name = "layoutControlItem16";
		this.layoutControlItem16.Size = new System.Drawing.Size(365, 24);
		this.layoutControlItem16.Text = "ต\u0e31\u0e49งแต\u0e48";
		this.layoutControlItem16.TextSize = new System.Drawing.Size(75, 13);
		this.layoutControlItem25.Control = this.txtPTYDateEnd;
		this.layoutControlItem25.Location = new System.Drawing.Point(0, 24);
		this.layoutControlItem25.Name = "layoutControlItem25";
		this.layoutControlItem25.Size = new System.Drawing.Size(365, 24);
		this.layoutControlItem25.Text = "ถ\u0e36ง";
		this.layoutControlItem25.TextSize = new System.Drawing.Size(75, 13);
		this.emptySpaceItem3.AllowHotTrack = false;
		this.emptySpaceItem3.Location = new System.Drawing.Point(0, 392);
		this.emptySpaceItem3.Name = "emptySpaceItem3";
		this.emptySpaceItem3.Size = new System.Drawing.Size(778, 61);
		this.emptySpaceItem3.TextSize = new System.Drawing.Size(0, 0);
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(1285, 569);
		base.Controls.Add(this.layoutControl1);
		base.Controls.Add(this.barDockControlLeft);
		base.Controls.Add(this.barDockControlRight);
		base.Controls.Add(this.barDockControlBottom);
		base.Controls.Add(this.barDockControlTop);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "FrmBookDetail";
		base.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
		this.Text = "Booking Detail";
		((System.ComponentModel.ISupportInitialize)this.barManager1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControl1).EndInit();
		this.layoutControl1.ResumeLayout(false);
		((System.ComponentModel.ISupportInitialize)this.txtTelDriver.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.checkEdit1.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtPartyCodeRef.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentCodeRef.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtFaxNoRef.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtOrderDateRef.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtFirstShop.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtSeriesImport.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtKeyType.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtModifyBy.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtModifyDate.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtCreateDate.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtCreateBy.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtRemarkBook.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtPTYDateEnd.Properties.CalendarTimeProperties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtPTYDateEnd.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtPTYDateStart.Properties.CalendarTimeProperties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtPTYDateStart.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtNationCode.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDepartureDate.Properties.CalendarTimeProperties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDepartureDate.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtArriveDate.Properties.CalendarTimeProperties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtArriveDate.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDocDate.Properties.CalendarTimeProperties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDocDate.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookTRP.Properties.CalendarTimeProperties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookTRP.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookRTH.Properties.CalendarTimeProperties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookRTH.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookBKF.Properties.CalendarTimeProperties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookBKF.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookJW.Properties.CalendarTimeProperties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDateBookJW.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtPax.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtTelGuide.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtTimeBookJW.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtRemark.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtCarCode.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtPartyCode.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtGuideName.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtGuideCode.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentName.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentCode.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDocTime.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtDocNo.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem10).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem17).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup4).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem23).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem22).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem24).EndInit();
		((System.ComponentModel.ISupportInitialize)this.emptySpaceItem1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup8).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem34).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem26).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem36).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem37).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem38).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem35).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup7).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem28).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem29).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem27).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem30).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem32).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem31).EndInit();
		((System.ComponentModel.ISupportInitialize)this.emptySpaceItem2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup9).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem13).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem3).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem4).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem5).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem9).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem6).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem7).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem21).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem11).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem12).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem18).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem14).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem15).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem33).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem8).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem19).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup6).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem16).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem25).EndInit();
		((System.ComponentModel.ISupportInitialize)this.emptySpaceItem3).EndInit();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
