using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Windows.Forms;
using DevExpress.XtraBars;
using DevExpress.XtraEditors;
using DevExpress.XtraGrid;
using DevExpress.XtraGrid.Columns;
using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;

namespace BookingInfor;

public class FrmSetupAppConfig : XtraForm
{
	private string categoryApp = "";

	private IContainer components = null;

	private BarManager barManager1;

	private Bar bar1;

	private Bar bar3;

	private BarDockControl barDockControlTop;

	private BarDockControl barDockControlBottom;

	private BarDockControl barDockControlLeft;

	private BarDockControl barDockControlRight;

	private BarLargeButtonItem btnEdit;

	private BarStaticItem barStaticItem1;

	private BarLargeButtonItem btnSave;

	private BarLargeButtonItem btnCancel;

	private BarStaticItem barStaticItem2;

	private BarLargeButtonItem btnAddDataConfig;

	private BarStaticItem barStaticItem3;

	private BarLargeButtonItem btnExit;

	private GridControl gridControl1;

	private GridView gridView1;

	private GridColumn gridColumn1;

	private GridColumn gridColumn2;

	private GridColumn gridColumn3;

	private GridColumn gridColumn4;

	private GridColumn gridColumn5;

	private GridColumn gridColumn6;

	public FrmSetupAppConfig()
	{
		InitializeComponent();
		InitialForm();
	}

	private void InitialForm()
	{
		categoryApp = "BOOKINGINFOR";
		ShowData();
	}

	private void ShowData()
	{
		enableButton(boolValue: true);
		disableGrid(boolValue: true);
		string stringQuery = "\r\n                    SELECT \r\n                        [Name]\r\n                        ,[Comment]\r\n                        ,[Value]\r\n                        ,[Category] \r\n                        ,[Type] \r\n                        ,[DefaultValue] \r\n                    FROM [dbo].[App_Config]\r\n                    WHERE [Category]='" + categoryApp + "'\r\n                    ORDER BY [Name]\r\n                    ";
		DataTable dt = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
		BindData(dt);
	}

	public void BindData(DataTable dt)
	{
		gridControl1.BeginUpdate();
		gridControl1.DataSource = null;
		gridControl1.DataSource = dt;
		gridView1.BestFitColumns();
		gridControl1.EndUpdate();
	}

	private void btnExit_ItemClick(object sender, ItemClickEventArgs e)
	{
		base.DialogResult = DialogResult.Cancel;
	}

	private void enableButton(bool boolValue)
	{
		btnEdit.Enabled = boolValue;
		btnSave.Enabled = !boolValue;
		btnCancel.Enabled = !boolValue;
		btnExit.Enabled = boolValue;
		btnAddDataConfig.Enabled = boolValue;
	}

	private void disableGrid(bool boolValue)
	{
		gridView1.OptionsBehavior.Editable = !boolValue;
	}

	private void btnEdit_ItemClick(object sender, ItemClickEventArgs e)
	{
		disableGrid(boolValue: false);
		enableButton(boolValue: false);
	}

	private void btnCancel_ItemClick(object sender, ItemClickEventArgs e)
	{
		disableGrid(boolValue: true);
		enableButton(boolValue: true);
		ShowData();
	}

	private void btnSave_ItemClick(object sender, ItemClickEventArgs e)
	{
		saveData();
		disableGrid(boolValue: true);
		enableButton(boolValue: true);
		ShowData();
	}

	private void saveData()
	{
		for (int i = 0; i < gridView1.DataRowCount; i++)
		{
			string text = gridView1.GetRowCellValue(i, "Name").ToString();
			string text2 = gridView1.GetRowCellValue(i, "Comment").ToString();
			string text3 = gridView1.GetRowCellValue(i, "Value").ToString();
			string text4 = gridView1.GetRowCellValue(i, "Category").ToString();
			string text5 = gridView1.GetRowCellValue(i, "Type").ToString();
			string text6 = gridView1.GetRowCellValue(i, "DefaultValue").ToString();
			string stringQuery = "SELECT Name FROM App_Config WHERE Category='" + categoryApp + "' and Name='" + text + "'";
			DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
			if (dataTable.Rows.Count > 0)
			{
				string stringQuery2 = "\r\n\r\n                                UPDATE App_Config\r\n                                SET \r\n                                    [Comment] = '" + text2 + "'\r\n                                    ,[Value] = '" + text3 + "'\r\n                                    ,[Category] = '" + text4 + "'\r\n                                    ,[Type] = '" + text5 + "'\r\n                                    ,[DefaultValue] = '" + text6 + "'\r\n                                WHERE [Name] = '" + text + "'\r\n\r\n                                    ";
				DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery2);
			}
			else
			{
				string stringQuery3 = "\r\n\r\n                            INSERT INTO App_Config ([Name],[Comment],[Value],[Category],[Type],[DefaultValue])\r\n                            VALUES ('" + text + "','" + text2 + "','" + text3 + "','" + text4 + "','" + text5 + "','" + text6 + "')\r\n\r\n                                    ";
				DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery3);
			}
		}
		XtraMessageBox.Show("Save Complete \n (ต\u0e49องให\u0e49 User ป\u0e34ดโปรแกรมแล\u0e49วใหม\u0e48เพ\u0e37\u0e48อให\u0e49 Get App Config)");
	}

	private void btnAddDataConfig_ItemClick(object sender, ItemClickEventArgs e)
	{
		DialogResult dialogResult = XtraMessageBox.Show("ต\u0e49องการซ\u0e48อม App Config ส\u0e48วนท\u0e35\u0e48ไม\u0e48ม\u0e35ใช\u0e48หร\u0e37อ ?", "ปร\u0e31บปร\u0e38ง App Config ", MessageBoxButtons.YesNo);
		if (dialogResult == DialogResult.No)
		{
			return;
		}
		DataTable dataTable = new DataTable();
		dataTable.Columns.Add("Name", typeof(string));
		dataTable.Columns.Add("Comment", typeof(string));
		dataTable.Columns.Add("Value", typeof(string));
		dataTable.Columns.Add("Category", typeof(string));
		dataTable.Columns.Add("Type", typeof(string));
		dataTable.Columns.Add("DefaultValue", typeof(string));
		dataTable.Rows.Add("BOOKING_CREATE_BONUS_LIST", "ม\u0e35เพ\u0e34\u0e48มหน\u0e49าเพ\u0e37\u0e48อสร\u0e49าง Bonus List ต\u0e49องการให\u0e49สร\u0e49าง Bonus List ใช\u0e48หร\u0e37อไม\u0e48", "N", "BOOKINGINFOR", "CheckBox", "N");
		dataTable.Rows.Add("BOOKING_FORMATECODE_GEN_BONUS", "กำหนดร\u0e39ปแบบ Format Code สร\u0e49าง Code Bonus Card โดย Code ม\u0e35ด\u0e31งน\u0e35\u0e49(GEI,PGC,.)", "", "BOOKINGINFOR", "TextBox", "");
		dataTable.Rows.Add("BOOKING_BONUS_SHOP", "กำหนดส\u0e48งค\u0e48า Bonus.Shop", "", "BOOKINGINFOR", "TextBox", "");
		dataTable.Rows.Add("BOOKING_BONUS_GUIDE", "กำหนดส\u0e48งค\u0e48า Bonus.Guide", "NO", "BOOKINGINFOR", "TextBox", "NO");
		for (int i = 0; i < dataTable.Rows.Count; i++)
		{
			string text = dataTable.Rows[i]["Name"].ToString();
			string text2 = dataTable.Rows[i]["Comment"].ToString();
			string text3 = dataTable.Rows[i]["Value"].ToString();
			string text4 = dataTable.Rows[i]["Category"].ToString();
			string text5 = dataTable.Rows[i]["Type"].ToString();
			string text6 = dataTable.Rows[i]["DefaultValue"].ToString();
			string stringQuery = "SELECT * FROM App_Config WHERE [Name]='" + text + "' and [Category]='" + text4 + "' ";
			DataTable dataTable2 = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery);
			if (dataTable2.Rows.Count == 0)
			{
				string stringQuery2 = "                    \r\n                        INSERT INTO App_Config ([Name],[Comment],[Value],[Category],[Type],[DefaultValue])\r\n                        VALUES ('" + text + "','" + text2 + "','" + text3 + "','" + text4 + "','" + text5 + "','" + text6 + "')                    \r\n                         ";
				DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery2);
			}
			else
			{
				string stringQuery3 = "                    \r\n                        UPDATE App_Config SET [Comment]='" + text2 + "' WHERE [Name]='" + text + "' and [Category]='" + text4 + "' \r\n\r\n                            ";
				DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, stringQuery3);
			}
		}
		ShowData();
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BookingInfor.FrmSetupAppConfig));
		this.barManager1 = new DevExpress.XtraBars.BarManager(this.components);
		this.bar1 = new DevExpress.XtraBars.Bar();
		this.btnEdit = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem1 = new DevExpress.XtraBars.BarStaticItem();
		this.btnSave = new DevExpress.XtraBars.BarLargeButtonItem();
		this.btnCancel = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem2 = new DevExpress.XtraBars.BarStaticItem();
		this.btnAddDataConfig = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem3 = new DevExpress.XtraBars.BarStaticItem();
		this.btnExit = new DevExpress.XtraBars.BarLargeButtonItem();
		this.bar3 = new DevExpress.XtraBars.Bar();
		this.barDockControlTop = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlBottom = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlLeft = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlRight = new DevExpress.XtraBars.BarDockControl();
		this.gridControl1 = new DevExpress.XtraGrid.GridControl();
		this.gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
		this.gridColumn1 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn2 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn3 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn4 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn5 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn6 = new DevExpress.XtraGrid.Columns.GridColumn();
		((System.ComponentModel.ISupportInitialize)this.barManager1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).BeginInit();
		base.SuspendLayout();
		this.barManager1.Bars.AddRange(new DevExpress.XtraBars.Bar[2] { this.bar1, this.bar3 });
		this.barManager1.DockControls.Add(this.barDockControlTop);
		this.barManager1.DockControls.Add(this.barDockControlBottom);
		this.barManager1.DockControls.Add(this.barDockControlLeft);
		this.barManager1.DockControls.Add(this.barDockControlRight);
		this.barManager1.Form = this;
		this.barManager1.Items.AddRange(new DevExpress.XtraBars.BarItem[8] { this.btnEdit, this.barStaticItem1, this.btnSave, this.btnCancel, this.barStaticItem2, this.btnAddDataConfig, this.barStaticItem3, this.btnExit });
		this.barManager1.MaxItemId = 8;
		this.barManager1.StatusBar = this.bar3;
		this.bar1.BarName = "Tools";
		this.bar1.DockCol = 0;
		this.bar1.DockRow = 0;
		this.bar1.DockStyle = DevExpress.XtraBars.BarDockStyle.Top;
		this.bar1.LinksPersistInfo.AddRange(new DevExpress.XtraBars.LinkPersistInfo[8]
		{
			new DevExpress.XtraBars.LinkPersistInfo(this.btnEdit),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem1),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnSave),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnCancel),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem2),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnAddDataConfig),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem3),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnExit)
		});
		this.bar1.OptionsBar.DrawBorder = false;
		this.bar1.OptionsBar.DrawDragBorder = false;
		this.bar1.Text = "Tools";
		this.btnEdit.Caption = "Edit";
		this.btnEdit.Glyph = (System.Drawing.Image)resources.GetObject("btnEdit.Glyph");
		this.btnEdit.Id = 0;
		this.btnEdit.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnEdit.LargeGlyph");
		this.btnEdit.Name = "btnEdit";
		this.btnEdit.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnEdit_ItemClick);
		this.barStaticItem1.Id = 1;
		this.barStaticItem1.Name = "barStaticItem1";
		this.barStaticItem1.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnSave.Caption = "Save";
		this.btnSave.Glyph = (System.Drawing.Image)resources.GetObject("btnSave.Glyph");
		this.btnSave.Id = 2;
		this.btnSave.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnSave.LargeGlyph");
		this.btnSave.Name = "btnSave";
		this.btnSave.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnSave_ItemClick);
		this.btnCancel.Caption = "Cancel";
		this.btnCancel.Glyph = (System.Drawing.Image)resources.GetObject("btnCancel.Glyph");
		this.btnCancel.Id = 3;
		this.btnCancel.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnCancel.LargeGlyph");
		this.btnCancel.Name = "btnCancel";
		this.btnCancel.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnCancel_ItemClick);
		this.barStaticItem2.Id = 4;
		this.barStaticItem2.Name = "barStaticItem2";
		this.barStaticItem2.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnAddDataConfig.Caption = "Prepair Data Setup To App_Config";
		this.btnAddDataConfig.Glyph = (System.Drawing.Image)resources.GetObject("btnAddDataConfig.Glyph");
		this.btnAddDataConfig.Id = 5;
		this.btnAddDataConfig.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnAddDataConfig.LargeGlyph");
		this.btnAddDataConfig.Name = "btnAddDataConfig";
		this.btnAddDataConfig.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnAddDataConfig_ItemClick);
		this.barStaticItem3.Id = 6;
		this.barStaticItem3.Name = "barStaticItem3";
		this.barStaticItem3.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnExit.Caption = "Exit";
		this.btnExit.Glyph = (System.Drawing.Image)resources.GetObject("btnExit.Glyph");
		this.btnExit.Id = 7;
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
		this.barDockControlTop.Size = new System.Drawing.Size(796, 60);
		this.barDockControlBottom.CausesValidation = false;
		this.barDockControlBottom.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.barDockControlBottom.Location = new System.Drawing.Point(0, 384);
		this.barDockControlBottom.Size = new System.Drawing.Size(796, 22);
		this.barDockControlLeft.CausesValidation = false;
		this.barDockControlLeft.Dock = System.Windows.Forms.DockStyle.Left;
		this.barDockControlLeft.Location = new System.Drawing.Point(0, 60);
		this.barDockControlLeft.Size = new System.Drawing.Size(0, 324);
		this.barDockControlRight.CausesValidation = false;
		this.barDockControlRight.Dock = System.Windows.Forms.DockStyle.Right;
		this.barDockControlRight.Location = new System.Drawing.Point(796, 60);
		this.barDockControlRight.Size = new System.Drawing.Size(0, 324);
		this.gridControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.gridControl1.Location = new System.Drawing.Point(0, 60);
		this.gridControl1.MainView = this.gridView1;
		this.gridControl1.MenuManager = this.barManager1;
		this.gridControl1.Name = "gridControl1";
		this.gridControl1.Size = new System.Drawing.Size(796, 324);
		this.gridControl1.TabIndex = 4;
		this.gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView1 });
		this.gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[6] { this.gridColumn1, this.gridColumn2, this.gridColumn3, this.gridColumn4, this.gridColumn5, this.gridColumn6 });
		this.gridView1.GridControl = this.gridControl1;
		this.gridView1.Name = "gridView1";
		this.gridView1.OptionsCustomization.AllowColumnMoving = false;
		this.gridView1.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView1.OptionsView.ShowGroupPanel = false;
		this.gridColumn1.Caption = "Name";
		this.gridColumn1.FieldName = "Name";
		this.gridColumn1.Name = "gridColumn1";
		this.gridColumn1.OptionsColumn.AllowEdit = false;
		this.gridColumn1.Visible = true;
		this.gridColumn1.VisibleIndex = 0;
		this.gridColumn2.Caption = "Comment";
		this.gridColumn2.FieldName = "Comment";
		this.gridColumn2.Name = "gridColumn2";
		this.gridColumn2.OptionsColumn.AllowEdit = false;
		this.gridColumn2.Visible = true;
		this.gridColumn2.VisibleIndex = 1;
		this.gridColumn3.Caption = "Value";
		this.gridColumn3.FieldName = "Value";
		this.gridColumn3.Name = "gridColumn3";
		this.gridColumn3.Visible = true;
		this.gridColumn3.VisibleIndex = 2;
		this.gridColumn4.Caption = "Category";
		this.gridColumn4.FieldName = "Category";
		this.gridColumn4.Name = "gridColumn4";
		this.gridColumn4.OptionsColumn.AllowEdit = false;
		this.gridColumn4.Visible = true;
		this.gridColumn4.VisibleIndex = 3;
		this.gridColumn5.Caption = "Type";
		this.gridColumn5.FieldName = "Type";
		this.gridColumn5.Name = "gridColumn5";
		this.gridColumn5.OptionsColumn.AllowEdit = false;
		this.gridColumn5.Visible = true;
		this.gridColumn5.VisibleIndex = 4;
		this.gridColumn6.Caption = "Default Value";
		this.gridColumn6.FieldName = "DefaultValue";
		this.gridColumn6.Name = "gridColumn6";
		this.gridColumn6.OptionsColumn.AllowEdit = false;
		this.gridColumn6.Visible = true;
		this.gridColumn6.VisibleIndex = 5;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(796, 406);
		base.Controls.Add(this.gridControl1);
		base.Controls.Add(this.barDockControlLeft);
		base.Controls.Add(this.barDockControlRight);
		base.Controls.Add(this.barDockControlBottom);
		base.Controls.Add(this.barDockControlTop);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "FrmSetupAppConfig";
		base.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
		this.Text = "Setup AppConfig";
		((System.ComponentModel.ISupportInitialize)this.barManager1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).EndInit();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
