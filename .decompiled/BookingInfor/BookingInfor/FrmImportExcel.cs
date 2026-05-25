using System;
using System.ComponentModel;
using System.Data;
using System.Data.OleDb;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using BookingInfor.DB;
using DevExpress.XtraBars;
using DevExpress.XtraEditors;
using DevExpress.XtraGrid;
using DevExpress.XtraGrid.Columns;
using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraSplashScreen;
using DevExpress.XtraTab;

namespace BookingInfor;

public class FrmImportExcel : XtraForm
{
	private string _fileExcelMain = "";

	private string _fileExcelDetail = "";

	private IContainer components = null;

	private BarManager barManager1;

	private Bar bar1;

	private Bar bar3;

	private BarDockControl barDockControlTop;

	private BarDockControl barDockControlBottom;

	private BarDockControl barDockControlLeft;

	private BarDockControl barDockControlRight;

	private BarLargeButtonItem btnImport;

	private BarLargeButtonItem btnClear;

	private BarStaticItem barStaticItem2;

	private BarLargeButtonItem btnExit;

	private OpenFileDialog openFileDialog1;

	private XtraTabControl xtraTabControl1;

	private XtraTabPage xtraTabPage1;

	private GridControl gridControl1;

	private GridView gridView1;

	private GridColumn gridColumn1;

	private GridColumn gridColumn2;

	private GridColumn gridColumn3;

	private GridColumn gridColumn4;

	private GridColumn gridColumn5;

	private GridColumn gridColumn6;

	private GridColumn gridColumn7;

	private GridColumn gridColumn8;

	private GridColumn gridColumn9;

	private GridColumn gridColumn10;

	private GridColumn gridColumn11;

	private GridColumn gridColumn12;

	private GridColumn gridColumn13;

	private GridColumn gridColumn14;

	private XtraTabPage xtraTabPage2;

	private GridControl gridControl2;

	private GridView gridView2;

	private GridColumn gridColumn15;

	private GridColumn gridColumn16;

	private GridColumn gridColumn17;

	private GridColumn gridColumn18;

	private GridColumn gridColumn19;

	private GridColumn gridColumn20;

	private GridColumn gridColumn21;

	private BarLargeButtonItem btnBrowseFile;

	private BarStaticItem barStaticItem4;

	private SplashScreenManager splashScreenManager1;

	public FrmImportExcel()
	{
		InitializeComponent();
	}

	private void btnExit_ItemClick(object sender, ItemClickEventArgs e)
	{
		base.DialogResult = DialogResult.Cancel;
	}

	private void BrowseFile()
	{
		Stream stream = null;
		OpenFileDialog openFileDialog = new OpenFileDialog();
		openFileDialog.InitialDirectory = Environment.GetFolderPath(Environment.SpecialFolder.Desktop).ToString();
		openFileDialog.Filter = " All Files (*.*)|*.* | Excel files (*.txt) | *.txt";
		openFileDialog.FilterIndex = 2;
		openFileDialog.RestoreDirectory = true;
		if (openFileDialog.ShowDialog() != DialogResult.OK)
		{
			return;
		}
		try
		{
			if ((stream = openFileDialog.OpenFile()) == null)
			{
				return;
			}
			using (stream)
			{
				FileStream fileStream = stream as FileStream;
				string name = fileStream.Name;
				DataSet dataSet = OpenFileReturnDateSet(name);
				if (dataSet == null)
				{
					return;
				}
				for (int i = 0; i < dataSet.Tables.Count; i++)
				{
					string text = dataSet.Tables[i].TableName.ToUpper();
					DataTable dt = dataSet.Tables[i];
					string text2 = text;
					if (!(text2 == "MAIN"))
					{
						if (text2 == "DETAIL")
						{
							BindData(gridControl2, dt);
							gridView2.BestFitColumns();
						}
					}
					else
					{
						BindData(gridControl1, dt);
						gridView1.BestFitColumns();
					}
				}
			}
		}
		catch (Exception ex)
		{
			MessageBox.Show("Error: Could not read file from disk. Original error: " + ex.Message);
		}
	}

	private void BindData(GridControl gridControl, DataTable dt)
	{
		gridControl.BeginUpdate();
		gridControl.DataSource = null;
		gridControl.DataSource = dt;
		gridControl.EndUpdate();
	}

	private DataSet OpenFileReturnDateSet(string fileName)
	{
		if (!File.Exists(fileName))
		{
			XtraMessageBox.Show("File not found");
			return null;
		}
		string text = "";
		text = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source={0};Extended Properties=Excel 12.0;";
		try
		{
			string text2 = string.Format(text, fileName);
			OleDbConnection oleDbConnection = new OleDbConnection(text2);
			oleDbConnection.Open();
			DataTable oleDbSchemaTable = oleDbConnection.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);
			if (oleDbSchemaTable == null)
			{
				return null;
			}
			DataSet dataSet = new DataSet();
			if (oleDbSchemaTable.Rows.Count > 0)
			{
				for (int i = 0; i < oleDbSchemaTable.Rows.Count; i++)
				{
					string text3 = oleDbSchemaTable.Rows[i]["TABLE_NAME"].ToString();
					OleDbDataAdapter oleDbDataAdapter = new OleDbDataAdapter("select * from [" + text3 + "]", text2);
					string srcTable = text3.Replace("$", "");
					oleDbDataAdapter.Fill(dataSet, srcTable);
				}
			}
			else
			{
				dataSet = null;
			}
			return dataSet;
		}
		catch (IOException ex)
		{
			if (ex.Source != null)
			{
				Console.WriteLine("IOException source: {0}", ex.Source);
			}
			throw;
		}
	}

	private void btnClear_ItemClick(object sender, ItemClickEventArgs e)
	{
		clearGrid();
	}

	private void clearGrid()
	{
		BindData(gridControl1, null);
		BindData(gridControl2, null);
	}

	private void btnBrowseFile_ItemClick(object sender, ItemClickEventArgs e)
	{
		BrowseFile();
	}

	public void ShowWaitForm()
	{
		if (splashScreenManager1.IsSplashFormVisible)
		{
			splashScreenManager1.CloseWaitForm();
		}
		splashScreenManager1.ShowWaitForm();
	}

	public void CloseWaitForm()
	{
		if (splashScreenManager1.IsSplashFormVisible)
		{
			splashScreenManager1.CloseWaitForm();
		}
	}

	private void btnImport_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.RowCount == 0)
		{
			XtraMessageBox.Show("No Data");
			return;
		}
		if (gridView2.RowCount == 0)
		{
			DialogResult dialogResult = XtraMessageBox.Show("ไม\u0e48ม\u0e35ข\u0e49อม\u0e39ลรายละเอ\u0e35ยด ต\u0e49องการ Import ข\u0e49อม\u0e39ลใช\u0e48หร\u0e37อไม\u0e48?", "Confirmation", MessageBoxButtons.YesNo);
			if (dialogResult == DialogResult.No)
			{
				return;
			}
		}
		for (int i = 0; i < gridView1.RowCount; i++)
		{
			DataRow dataRow = gridView1.GetDataRow(i);
			string text = dataRow["PARTYCODE_REF"].ToString();
			if (DataSQL.IsDuplicateDataImport(text))
			{
				XtraMessageBox.Show("PartyCode Ref = " + text + " ซ\u0e49ำ ไม\u0e48สามารถ Import ข\u0e49อม\u0e39ลได\u0e49 โปรดตรวจสอบข\u0e49อม\u0e39ล");
				return;
			}
		}
		ShowWaitForm();
		splashScreenManager1.SetWaitFormCaption("Procesing 1 of 2 ");
		int rowCount = gridView1.RowCount;
		int maxSeriesNo = DataSQL.GetMaxSeriesNo();
		maxSeriesNo++;
		for (int j = 0; j < gridView1.RowCount; j++)
		{
			splashScreenManager1.SetWaitFormDescription("Import row ..." + (j + 1) + " of " + rowCount);
			DataRow dataRow2 = gridView1.GetDataRow(j);
			bookArg bookArg = new bookArg();
			string serverTime = DataSQL.GetServerTime();
			string docNo = DataSQL.GenerateDocNo();
			bookArg.docDate = ParaClass.ServerDate;
			bookArg.docTime = serverTime;
			bookArg.docNo = docNo;
			bookArg.agentCode = "";
			bookArg.agentName = dataRow2["AGENT_NAME"].ToString();
			bookArg.partyCode = dataRow2["PARTYCODE"].ToString();
			bookArg.guideCode = "";
			bookArg.guideName = dataRow2["GUIDENAME"].ToString();
			bookArg.telGuide = dataRow2["TEL_GUIDE"].ToString();
			bookArg.carCode = dataRow2["CARCODE"].ToString();
			bookArg.pax = Convert.ToInt16(dataRow2["PAX"]);
			bookArg.remark = "";
			bookArg.dateBookJW = null;
			bookArg.timeBookJW = "";
			bookArg.dateBookBKF = null;
			bookArg.timeBookBKF = "";
			bookArg.dateBookRTH = null;
			bookArg.timeBookRTH = "";
			bookArg.dateBookTRP = null;
			bookArg.timeBookTRP = "";
			bookArg.ptyDateStart = null;
			bookArg.ptyDateEnd = null;
			bookArg.arriveDate = Convert.ToDateTime(dataRow2["ARRIVE_DATE"]);
			bookArg.departureDate = Convert.ToDateTime(dataRow2["DEPARTURE_DATE"]);
			bookArg.nationCode = dataRow2["NATION_CODE"].ToString();
			bookArg.firstShop = "G";
			bookArg.complete = "N";
			bookArg.orderDate = Convert.ToDateTime(dataRow2["ORDER_DATE"]);
			bookArg.faxNo = Convert.ToInt16(dataRow2["FAX_NO"]);
			bookArg.agentCodeRef = dataRow2["AGENTCODE_REF"].ToString();
			bookArg.partyCodeRef = dataRow2["PARTYCODE_REF"].ToString();
			bookArg.remarkBook = dataRow2["BOOK_REMARK"].ToString();
			bookArg.importType = "ExcelImport";
			bookArg.seriesNo = maxSeriesNo;
			bool isEdit = false;
			DataSQL.SaveBookingData(isEdit, bookArg);
		}
		splashScreenManager1.SetWaitFormCaption("Procesing 2 of 2 ");
		rowCount = gridView2.RowCount;
		for (int k = 0; k < gridView2.RowCount; k++)
		{
			splashScreenManager1.SetWaitFormDescription("Import row ..." + (k + 1) + " of " + rowCount);
			DataRow dataRow3 = gridView2.GetDataRow(k);
			BookFaxOrderPlaceArg bookFaxOrderPlaceArg = new BookFaxOrderPlaceArg();
			bookFaxOrderPlaceArg.orderDate = Convert.ToDateTime(dataRow3["ORDER_DATE"]);
			bookFaxOrderPlaceArg.faxNo = Convert.ToInt16(dataRow3["FAX_NO"]);
			bookFaxOrderPlaceArg.agentCode = dataRow3["AGENT_CODE"].ToString();
			bookFaxOrderPlaceArg.partyCode = dataRow3["CODE"].ToString();
			bookFaxOrderPlaceArg.placeCode = dataRow3["PLACE_CODE"].ToString();
			bookFaxOrderPlaceArg.startDate = Convert.ToDateTime(dataRow3["START_DATE"]);
			bookFaxOrderPlaceArg.endDate = Convert.ToDateTime(dataRow3["END_DATE"]);
			bookFaxOrderPlaceArg.seriesNo = maxSeriesNo;
			DataSQL.InsertFaxOrderPlace(bookFaxOrderPlaceArg);
		}
		CloseWaitForm();
		int num = DataSQL.CountRowDataFromSeriesNo(maxSeriesNo, "Main");
		int num2 = DataSQL.CountRowDataFromSeriesNo(maxSeriesNo, "Detail");
		XtraMessageBox.Show("Import Main = " + num + " rows" + Environment.NewLine + "Import item = " + num2 + " rows" + Environment.NewLine + "Complete");
		clearGrid();
		DeleteFileExcel();
	}

	private void DeleteFileExcel()
	{
		if (_fileExcelMain != "")
		{
			try
			{
				File.Delete(_fileExcelMain);
			}
			catch (IOException ex)
			{
				MessageBox.Show(ex.Message);
			}
		}
		if (_fileExcelDetail != "")
		{
			try
			{
				File.Delete(_fileExcelDetail);
			}
			catch (IOException ex2)
			{
				MessageBox.Show(ex2.Message);
			}
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BookingInfor.FrmImportExcel));
		this.barManager1 = new DevExpress.XtraBars.BarManager(this.components);
		this.bar1 = new DevExpress.XtraBars.Bar();
		this.btnBrowseFile = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem4 = new DevExpress.XtraBars.BarStaticItem();
		this.btnImport = new DevExpress.XtraBars.BarLargeButtonItem();
		this.btnClear = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem2 = new DevExpress.XtraBars.BarStaticItem();
		this.btnExit = new DevExpress.XtraBars.BarLargeButtonItem();
		this.bar3 = new DevExpress.XtraBars.Bar();
		this.barDockControlTop = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlBottom = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlLeft = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlRight = new DevExpress.XtraBars.BarDockControl();
		this.openFileDialog1 = new System.Windows.Forms.OpenFileDialog();
		this.xtraTabControl1 = new DevExpress.XtraTab.XtraTabControl();
		this.xtraTabPage1 = new DevExpress.XtraTab.XtraTabPage();
		this.gridControl1 = new DevExpress.XtraGrid.GridControl();
		this.gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
		this.gridColumn1 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn2 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn3 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn4 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn5 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn6 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn7 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn8 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn9 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn10 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn11 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn12 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn13 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn14 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.xtraTabPage2 = new DevExpress.XtraTab.XtraTabPage();
		this.gridControl2 = new DevExpress.XtraGrid.GridControl();
		this.gridView2 = new DevExpress.XtraGrid.Views.Grid.GridView();
		this.gridColumn15 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn16 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn17 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn18 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn19 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn20 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn21 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.splashScreenManager1 = new DevExpress.XtraSplashScreen.SplashScreenManager(this, typeof(BookingInfor.WaitForm1), true, true);
		((System.ComponentModel.ISupportInitialize)this.barManager1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.xtraTabControl1).BeginInit();
		this.xtraTabControl1.SuspendLayout();
		this.xtraTabPage1.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).BeginInit();
		this.xtraTabPage2.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.gridControl2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridView2).BeginInit();
		base.SuspendLayout();
		this.barManager1.Bars.AddRange(new DevExpress.XtraBars.Bar[2] { this.bar1, this.bar3 });
		this.barManager1.DockControls.Add(this.barDockControlTop);
		this.barManager1.DockControls.Add(this.barDockControlBottom);
		this.barManager1.DockControls.Add(this.barDockControlLeft);
		this.barManager1.DockControls.Add(this.barDockControlRight);
		this.barManager1.Form = this;
		this.barManager1.Items.AddRange(new DevExpress.XtraBars.BarItem[6] { this.btnImport, this.btnClear, this.barStaticItem2, this.btnExit, this.btnBrowseFile, this.barStaticItem4 });
		this.barManager1.MaxItemId = 14;
		this.barManager1.StatusBar = this.bar3;
		this.bar1.BarName = "Tools";
		this.bar1.DockCol = 0;
		this.bar1.DockRow = 0;
		this.bar1.DockStyle = DevExpress.XtraBars.BarDockStyle.Top;
		this.bar1.LinksPersistInfo.AddRange(new DevExpress.XtraBars.LinkPersistInfo[6]
		{
			new DevExpress.XtraBars.LinkPersistInfo(this.btnBrowseFile),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem4),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnImport),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnClear),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem2),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnExit)
		});
		this.bar1.OptionsBar.DrawBorder = false;
		this.bar1.OptionsBar.DrawDragBorder = false;
		this.bar1.Text = "Tools";
		this.btnBrowseFile.Caption = "Browse File";
		this.btnBrowseFile.Glyph = (System.Drawing.Image)resources.GetObject("btnBrowseFile.Glyph");
		this.btnBrowseFile.Id = 12;
		this.btnBrowseFile.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnBrowseFile.LargeGlyph");
		this.btnBrowseFile.Name = "btnBrowseFile";
		this.btnBrowseFile.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnBrowseFile_ItemClick);
		this.barStaticItem4.Id = 13;
		this.barStaticItem4.Name = "barStaticItem4";
		this.barStaticItem4.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnImport.Caption = "Import To DB";
		this.btnImport.Glyph = (System.Drawing.Image)resources.GetObject("btnImport.Glyph");
		this.btnImport.Id = 2;
		this.btnImport.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnImport.LargeGlyph");
		this.btnImport.Name = "btnImport";
		this.btnImport.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnImport_ItemClick);
		this.btnClear.Caption = "Clear all grid";
		this.btnClear.Glyph = (System.Drawing.Image)resources.GetObject("btnClear.Glyph");
		this.btnClear.Id = 3;
		this.btnClear.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnClear.LargeGlyph");
		this.btnClear.Name = "btnClear";
		this.btnClear.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnClear_ItemClick);
		this.barStaticItem2.Id = 5;
		this.barStaticItem2.Name = "barStaticItem2";
		this.barStaticItem2.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnExit.Caption = "Exit";
		this.btnExit.Glyph = (System.Drawing.Image)resources.GetObject("btnExit.Glyph");
		this.btnExit.Id = 6;
		this.btnExit.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnExit.LargeGlyph");
		this.btnExit.Name = "btnExit";
		this.btnExit.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnExit_ItemClick);
		this.bar3.BarName = "Status bar";
		this.bar3.CanDockStyle = DevExpress.XtraBars.BarCanDockStyle.Bottom;
		this.bar3.DockCol = 0;
		this.bar3.DockRow = 0;
		this.bar3.DockStyle = DevExpress.XtraBars.BarDockStyle.Bottom;
		this.bar3.OptionsBar.AllowQuickCustomization = false;
		this.bar3.OptionsBar.DrawDragBorder = false;
		this.bar3.OptionsBar.UseWholeRow = true;
		this.bar3.Text = "Status bar";
		this.barDockControlTop.CausesValidation = false;
		this.barDockControlTop.Dock = System.Windows.Forms.DockStyle.Top;
		this.barDockControlTop.Location = new System.Drawing.Point(0, 0);
		this.barDockControlTop.Size = new System.Drawing.Size(1036, 60);
		this.barDockControlBottom.CausesValidation = false;
		this.barDockControlBottom.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.barDockControlBottom.Location = new System.Drawing.Point(0, 417);
		this.barDockControlBottom.Size = new System.Drawing.Size(1036, 22);
		this.barDockControlLeft.CausesValidation = false;
		this.barDockControlLeft.Dock = System.Windows.Forms.DockStyle.Left;
		this.barDockControlLeft.Location = new System.Drawing.Point(0, 60);
		this.barDockControlLeft.Size = new System.Drawing.Size(0, 357);
		this.barDockControlRight.CausesValidation = false;
		this.barDockControlRight.Dock = System.Windows.Forms.DockStyle.Right;
		this.barDockControlRight.Location = new System.Drawing.Point(1036, 60);
		this.barDockControlRight.Size = new System.Drawing.Size(0, 357);
		this.openFileDialog1.FileName = "openFileDialog1";
		this.xtraTabControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.xtraTabControl1.Location = new System.Drawing.Point(0, 60);
		this.xtraTabControl1.Name = "xtraTabControl1";
		this.xtraTabControl1.SelectedTabPage = this.xtraTabPage1;
		this.xtraTabControl1.Size = new System.Drawing.Size(1036, 357);
		this.xtraTabControl1.TabIndex = 9;
		this.xtraTabControl1.TabPages.AddRange(new DevExpress.XtraTab.XtraTabPage[2] { this.xtraTabPage1, this.xtraTabPage2 });
		this.xtraTabPage1.Controls.Add(this.gridControl1);
		this.xtraTabPage1.Image = (System.Drawing.Image)resources.GetObject("xtraTabPage1.Image");
		this.xtraTabPage1.Name = "xtraTabPage1";
		this.xtraTabPage1.Size = new System.Drawing.Size(1034, 327);
		this.xtraTabPage1.Text = "Main";
		this.gridControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.gridControl1.Location = new System.Drawing.Point(0, 0);
		this.gridControl1.MainView = this.gridView1;
		this.gridControl1.MenuManager = this.barManager1;
		this.gridControl1.Name = "gridControl1";
		this.gridControl1.Size = new System.Drawing.Size(1034, 327);
		this.gridControl1.TabIndex = 5;
		this.gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView1 });
		this.gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[14]
		{
			this.gridColumn1, this.gridColumn2, this.gridColumn3, this.gridColumn4, this.gridColumn5, this.gridColumn6, this.gridColumn7, this.gridColumn8, this.gridColumn9, this.gridColumn10,
			this.gridColumn11, this.gridColumn12, this.gridColumn13, this.gridColumn14
		});
		this.gridView1.GridControl = this.gridControl1;
		this.gridView1.Name = "gridView1";
		this.gridView1.OptionsBehavior.Editable = false;
		this.gridView1.OptionsCustomization.AllowColumnMoving = false;
		this.gridView1.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView1.OptionsView.ShowGroupPanel = false;
		this.gridColumn1.Caption = "Agent Name";
		this.gridColumn1.FieldName = "AGENT_NAME";
		this.gridColumn1.Name = "gridColumn1";
		this.gridColumn1.Visible = true;
		this.gridColumn1.VisibleIndex = 0;
		this.gridColumn2.Caption = "Guide Name";
		this.gridColumn2.FieldName = "GUIDENAME";
		this.gridColumn2.Name = "gridColumn2";
		this.gridColumn2.Visible = true;
		this.gridColumn2.VisibleIndex = 1;
		this.gridColumn3.Caption = "Tel Guide";
		this.gridColumn3.FieldName = "TEL_GUIDE";
		this.gridColumn3.Name = "gridColumn3";
		this.gridColumn3.Visible = true;
		this.gridColumn3.VisibleIndex = 2;
		this.gridColumn4.Caption = "PartyCode";
		this.gridColumn4.FieldName = "PARTYCODE";
		this.gridColumn4.Name = "gridColumn4";
		this.gridColumn4.Visible = true;
		this.gridColumn4.VisibleIndex = 3;
		this.gridColumn5.Caption = "Pax";
		this.gridColumn5.FieldName = "PAX";
		this.gridColumn5.Name = "gridColumn5";
		this.gridColumn5.Visible = true;
		this.gridColumn5.VisibleIndex = 4;
		this.gridColumn6.Caption = "Car Code";
		this.gridColumn6.FieldName = "CARCODE";
		this.gridColumn6.Name = "gridColumn6";
		this.gridColumn6.Visible = true;
		this.gridColumn6.VisibleIndex = 5;
		this.gridColumn7.Caption = "Arrive Date";
		this.gridColumn7.FieldName = "ARRIVE_DATE";
		this.gridColumn7.Name = "gridColumn7";
		this.gridColumn7.Visible = true;
		this.gridColumn7.VisibleIndex = 6;
		this.gridColumn8.Caption = "Departure Date";
		this.gridColumn8.FieldName = "DEPARTURE_DATE";
		this.gridColumn8.Name = "gridColumn8";
		this.gridColumn8.Visible = true;
		this.gridColumn8.VisibleIndex = 7;
		this.gridColumn9.Caption = "Nation";
		this.gridColumn9.FieldName = "NATION_CODE";
		this.gridColumn9.Name = "gridColumn9";
		this.gridColumn9.Visible = true;
		this.gridColumn9.VisibleIndex = 8;
		this.gridColumn10.Caption = "Order Date";
		this.gridColumn10.FieldName = "ORDER_DATE";
		this.gridColumn10.Name = "gridColumn10";
		this.gridColumn10.Visible = true;
		this.gridColumn10.VisibleIndex = 9;
		this.gridColumn11.Caption = "Fax No";
		this.gridColumn11.FieldName = "FAX_NO";
		this.gridColumn11.Name = "gridColumn11";
		this.gridColumn11.Visible = true;
		this.gridColumn11.VisibleIndex = 10;
		this.gridColumn12.Caption = "AgentCode Ref";
		this.gridColumn12.FieldName = "AGENTCODE_REF";
		this.gridColumn12.Name = "gridColumn12";
		this.gridColumn12.Visible = true;
		this.gridColumn12.VisibleIndex = 11;
		this.gridColumn13.Caption = "PartyCode Ref";
		this.gridColumn13.FieldName = "PARTYCODE_REF";
		this.gridColumn13.Name = "gridColumn13";
		this.gridColumn13.Visible = true;
		this.gridColumn13.VisibleIndex = 12;
		this.gridColumn14.Caption = "Remark Book";
		this.gridColumn14.FieldName = "BOOK_REMARK";
		this.gridColumn14.Name = "gridColumn14";
		this.gridColumn14.Visible = true;
		this.gridColumn14.VisibleIndex = 13;
		this.xtraTabPage2.Controls.Add(this.gridControl2);
		this.xtraTabPage2.Image = (System.Drawing.Image)resources.GetObject("xtraTabPage2.Image");
		this.xtraTabPage2.Name = "xtraTabPage2";
		this.xtraTabPage2.Size = new System.Drawing.Size(1034, 327);
		this.xtraTabPage2.Text = "Detail";
		this.gridControl2.Dock = System.Windows.Forms.DockStyle.Fill;
		this.gridControl2.Location = new System.Drawing.Point(0, 0);
		this.gridControl2.MainView = this.gridView2;
		this.gridControl2.MenuManager = this.barManager1;
		this.gridControl2.Name = "gridControl2";
		this.gridControl2.Size = new System.Drawing.Size(1034, 327);
		this.gridControl2.TabIndex = 1;
		this.gridControl2.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView2 });
		this.gridView2.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[7] { this.gridColumn15, this.gridColumn16, this.gridColumn17, this.gridColumn18, this.gridColumn19, this.gridColumn20, this.gridColumn21 });
		this.gridView2.GridControl = this.gridControl2;
		this.gridView2.Name = "gridView2";
		this.gridView2.OptionsBehavior.Editable = false;
		this.gridView2.OptionsCustomization.AllowColumnMoving = false;
		this.gridView2.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView2.OptionsView.ShowGroupPanel = false;
		this.gridColumn15.Caption = "Order Date";
		this.gridColumn15.FieldName = "ORDER_DATE";
		this.gridColumn15.Name = "gridColumn15";
		this.gridColumn15.Visible = true;
		this.gridColumn15.VisibleIndex = 0;
		this.gridColumn16.Caption = "Fax No";
		this.gridColumn16.FieldName = "FAX_NO";
		this.gridColumn16.Name = "gridColumn16";
		this.gridColumn16.Visible = true;
		this.gridColumn16.VisibleIndex = 1;
		this.gridColumn17.Caption = "Agent Code";
		this.gridColumn17.FieldName = "AGENT_CODE";
		this.gridColumn17.Name = "gridColumn17";
		this.gridColumn17.Visible = true;
		this.gridColumn17.VisibleIndex = 2;
		this.gridColumn18.Caption = "Code";
		this.gridColumn18.FieldName = "CODE";
		this.gridColumn18.Name = "gridColumn18";
		this.gridColumn18.Visible = true;
		this.gridColumn18.VisibleIndex = 3;
		this.gridColumn19.Caption = "Place";
		this.gridColumn19.FieldName = "PLACE_CODE";
		this.gridColumn19.Name = "gridColumn19";
		this.gridColumn19.Visible = true;
		this.gridColumn19.VisibleIndex = 4;
		this.gridColumn20.Caption = "Start Date";
		this.gridColumn20.FieldName = "START_DATE";
		this.gridColumn20.Name = "gridColumn20";
		this.gridColumn20.Visible = true;
		this.gridColumn20.VisibleIndex = 5;
		this.gridColumn21.Caption = "End Date";
		this.gridColumn21.FieldName = "END_DATE";
		this.gridColumn21.Name = "gridColumn21";
		this.gridColumn21.Visible = true;
		this.gridColumn21.VisibleIndex = 6;
		this.splashScreenManager1.ClosingDelay = 500;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(1036, 439);
		base.Controls.Add(this.xtraTabControl1);
		base.Controls.Add(this.barDockControlLeft);
		base.Controls.Add(this.barDockControlRight);
		base.Controls.Add(this.barDockControlBottom);
		base.Controls.Add(this.barDockControlTop);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "FrmImportExcel";
		base.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
		this.Text = "Import From Excel";
		base.WindowState = System.Windows.Forms.FormWindowState.Maximized;
		((System.ComponentModel.ISupportInitialize)this.barManager1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.xtraTabControl1).EndInit();
		this.xtraTabControl1.ResumeLayout(false);
		this.xtraTabPage1.ResumeLayout(false);
		((System.ComponentModel.ISupportInitialize)this.gridControl1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).EndInit();
		this.xtraTabPage2.ResumeLayout(false);
		((System.ComponentModel.ISupportInitialize)this.gridControl2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView2).EndInit();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
