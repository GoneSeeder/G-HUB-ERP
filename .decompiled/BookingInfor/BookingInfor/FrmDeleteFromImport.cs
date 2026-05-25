using System;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Windows.Forms;
using BookingInfor.DB;
using DevExpress.Images;
using DevExpress.Utils;
using DevExpress.XtraBars;
using DevExpress.XtraEditors;
using DevExpress.XtraEditors.Controls;
using DevExpress.XtraEditors.Repository;
using DevExpress.XtraGrid;
using DevExpress.XtraGrid.Columns;
using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraTab;

namespace BookingInfor;

public class FrmDeleteFromImport : XtraForm
{
	private IContainer components = null;

	private BarManager barManager1;

	private Bar bar1;

	private Bar bar3;

	private BarDockControl barDockControlTop;

	private BarDockControl barDockControlBottom;

	private BarDockControl barDockControlLeft;

	private BarDockControl barDockControlRight;

	private BarLargeButtonItem btnDeleteDB;

	private BarStaticItem barStaticItem1;

	private BarLargeButtonItem btnExit;

	private XtraTabControl xtraTabControl1;

	private XtraTabPage xtraTabPage1;

	private XtraTabPage xtraTabPage2;

	private PanelControl panelControl1;

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

	private GridControl gridControl2;

	private GridView gridView2;

	private GridColumn gridColumn15;

	private GridColumn gridColumn16;

	private GridColumn gridColumn17;

	private GridColumn gridColumn18;

	private GridColumn gridColumn19;

	private GridColumn gridColumn20;

	private GridColumn gridColumn21;

	private LabelControl labelControl1;

	private LookUpEdit LookupEditSeriesNo;

	private GridColumn gridColumn22;

	private RepositoryItemImageComboBox repositoryItemImageComboBox1;

	private ImageCollection image16x16;

	public FrmDeleteFromImport()
	{
		InitializeComponent();
		InitPage();
	}

	private void btnExit_ItemClick(object sender, ItemClickEventArgs e)
	{
		base.DialogResult = DialogResult.Cancel;
	}

	private void InitPage()
	{
		DataTable seriesNo = DataSQL.GetSeriesNo();
		LookupEditSeriesNo.Properties.DataSource = seriesNo;
		LookupEditSeriesNo.Properties.ValueMember = "Import_SeriesNo";
		LookupEditSeriesNo.Properties.DisplayMember = "Import_SeriesNo";
	}

	private void LookupEditSeriesNo_EditValueChanged(object sender, EventArgs e)
	{
		ShowData();
	}

	private void ShowData()
	{
		int seriesNo = (int)LookupEditSeriesNo.EditValue;
		DataTable dataMainFromSeriesNo = DataSQL.GetDataMainFromSeriesNo(seriesNo);
		BindData(gridControl1, dataMainFromSeriesNo);
		gridView1.BestFitColumns();
		DataTable dataDetailFromSeriesNo = DataSQL.GetDataDetailFromSeriesNo(seriesNo);
		BindData(gridControl2, dataDetailFromSeriesNo);
		gridView2.BestFitColumns();
	}

	private void BindData(GridControl gridControl, DataTable dt)
	{
		gridControl.BeginUpdate();
		gridControl.DataSource = null;
		gridControl.DataSource = dt;
		gridControl.EndUpdate();
	}

	private void btnDeleteDB_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.DataRowCount == 0)
		{
			return;
		}
		DialogResult dialogResult = XtraMessageBox.Show("Do you want to Delete?", "Confirmation Delete", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2);
		if (dialogResult == DialogResult.Yes)
		{
			int seriesNo = (int)LookupEditSeriesNo.EditValue;
			if (DataSQL.DeleteBookingDataFromSeriesNo(seriesNo))
			{
				base.DialogResult = DialogResult.OK;
			}
			else
			{
				base.DialogResult = DialogResult.Cancel;
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BookingInfor.FrmDeleteFromImport));
		this.barManager1 = new DevExpress.XtraBars.BarManager(this.components);
		this.bar1 = new DevExpress.XtraBars.Bar();
		this.btnDeleteDB = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem1 = new DevExpress.XtraBars.BarStaticItem();
		this.btnExit = new DevExpress.XtraBars.BarLargeButtonItem();
		this.bar3 = new DevExpress.XtraBars.Bar();
		this.barDockControlTop = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlBottom = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlLeft = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlRight = new DevExpress.XtraBars.BarDockControl();
		this.panelControl1 = new DevExpress.XtraEditors.PanelControl();
		this.labelControl1 = new DevExpress.XtraEditors.LabelControl();
		this.LookupEditSeriesNo = new DevExpress.XtraEditors.LookUpEdit();
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
		this.gridColumn22 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.repositoryItemImageComboBox1 = new DevExpress.XtraEditors.Repository.RepositoryItemImageComboBox();
		this.image16x16 = new DevExpress.Utils.ImageCollection(this.components);
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
		((System.ComponentModel.ISupportInitialize)this.barManager1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.panelControl1).BeginInit();
		this.panelControl1.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.LookupEditSeriesNo.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.xtraTabControl1).BeginInit();
		this.xtraTabControl1.SuspendLayout();
		this.xtraTabPage1.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.image16x16).BeginInit();
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
		this.barManager1.Items.AddRange(new DevExpress.XtraBars.BarItem[3] { this.btnDeleteDB, this.barStaticItem1, this.btnExit });
		this.barManager1.MaxItemId = 3;
		this.barManager1.StatusBar = this.bar3;
		this.bar1.BarName = "Tools";
		this.bar1.DockCol = 0;
		this.bar1.DockRow = 0;
		this.bar1.DockStyle = DevExpress.XtraBars.BarDockStyle.Top;
		this.bar1.LinksPersistInfo.AddRange(new DevExpress.XtraBars.LinkPersistInfo[3]
		{
			new DevExpress.XtraBars.LinkPersistInfo(this.btnDeleteDB),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem1),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnExit)
		});
		this.bar1.OptionsBar.DrawBorder = false;
		this.bar1.OptionsBar.DrawDragBorder = false;
		this.bar1.Text = "Tools";
		this.btnDeleteDB.Caption = "Delete Data";
		this.btnDeleteDB.Glyph = (System.Drawing.Image)resources.GetObject("btnDeleteDB.Glyph");
		this.btnDeleteDB.Id = 0;
		this.btnDeleteDB.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnDeleteDB.LargeGlyph");
		this.btnDeleteDB.Name = "btnDeleteDB";
		this.btnDeleteDB.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnDeleteDB_ItemClick);
		this.barStaticItem1.Id = 1;
		this.barStaticItem1.Name = "barStaticItem1";
		this.barStaticItem1.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnExit.Caption = "Exit";
		this.btnExit.Glyph = (System.Drawing.Image)resources.GetObject("btnExit.Glyph");
		this.btnExit.Id = 2;
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
		this.barDockControlTop.Size = new System.Drawing.Size(926, 60);
		this.barDockControlBottom.CausesValidation = false;
		this.barDockControlBottom.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.barDockControlBottom.Location = new System.Drawing.Point(0, 428);
		this.barDockControlBottom.Size = new System.Drawing.Size(926, 22);
		this.barDockControlLeft.CausesValidation = false;
		this.barDockControlLeft.Dock = System.Windows.Forms.DockStyle.Left;
		this.barDockControlLeft.Location = new System.Drawing.Point(0, 60);
		this.barDockControlLeft.Size = new System.Drawing.Size(0, 368);
		this.barDockControlRight.CausesValidation = false;
		this.barDockControlRight.Dock = System.Windows.Forms.DockStyle.Right;
		this.barDockControlRight.Location = new System.Drawing.Point(926, 60);
		this.barDockControlRight.Size = new System.Drawing.Size(0, 368);
		this.panelControl1.Controls.Add(this.labelControl1);
		this.panelControl1.Controls.Add(this.LookupEditSeriesNo);
		this.panelControl1.Dock = System.Windows.Forms.DockStyle.Top;
		this.panelControl1.Location = new System.Drawing.Point(0, 60);
		this.panelControl1.Name = "panelControl1";
		this.panelControl1.Size = new System.Drawing.Size(926, 50);
		this.panelControl1.TabIndex = 4;
		this.labelControl1.Location = new System.Drawing.Point(27, 18);
		this.labelControl1.Name = "labelControl1";
		this.labelControl1.Size = new System.Drawing.Size(96, 13);
		this.labelControl1.TabIndex = 1;
		this.labelControl1.Text = "Select Series Import";
		this.LookupEditSeriesNo.Location = new System.Drawing.Point(129, 15);
		this.LookupEditSeriesNo.MenuManager = this.barManager1;
		this.LookupEditSeriesNo.Name = "LookupEditSeriesNo";
		this.LookupEditSeriesNo.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.LookupEditSeriesNo.Properties.NullText = "[Select Series Import]";
		this.LookupEditSeriesNo.Size = new System.Drawing.Size(133, 20);
		this.LookupEditSeriesNo.TabIndex = 0;
		this.LookupEditSeriesNo.EditValueChanged += new System.EventHandler(LookupEditSeriesNo_EditValueChanged);
		this.xtraTabControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.xtraTabControl1.Location = new System.Drawing.Point(0, 110);
		this.xtraTabControl1.Name = "xtraTabControl1";
		this.xtraTabControl1.SelectedTabPage = this.xtraTabPage1;
		this.xtraTabControl1.Size = new System.Drawing.Size(926, 318);
		this.xtraTabControl1.TabIndex = 5;
		this.xtraTabControl1.TabPages.AddRange(new DevExpress.XtraTab.XtraTabPage[2] { this.xtraTabPage1, this.xtraTabPage2 });
		this.xtraTabPage1.Controls.Add(this.gridControl1);
		this.xtraTabPage1.Image = (System.Drawing.Image)resources.GetObject("xtraTabPage1.Image");
		this.xtraTabPage1.Name = "xtraTabPage1";
		this.xtraTabPage1.Size = new System.Drawing.Size(924, 288);
		this.xtraTabPage1.Text = "Main";
		this.gridControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.gridControl1.Location = new System.Drawing.Point(0, 0);
		this.gridControl1.MainView = this.gridView1;
		this.gridControl1.MenuManager = this.barManager1;
		this.gridControl1.Name = "gridControl1";
		this.gridControl1.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[1] { this.repositoryItemImageComboBox1 });
		this.gridControl1.Size = new System.Drawing.Size(924, 288);
		this.gridControl1.TabIndex = 7;
		this.gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView1 });
		this.gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[15]
		{
			this.gridColumn1, this.gridColumn2, this.gridColumn3, this.gridColumn4, this.gridColumn5, this.gridColumn6, this.gridColumn7, this.gridColumn8, this.gridColumn9, this.gridColumn10,
			this.gridColumn11, this.gridColumn12, this.gridColumn13, this.gridColumn14, this.gridColumn22
		});
		this.gridView1.GridControl = this.gridControl1;
		this.gridView1.Name = "gridView1";
		this.gridView1.OptionsBehavior.Editable = false;
		this.gridView1.OptionsCustomization.AllowColumnMoving = false;
		this.gridView1.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView1.OptionsView.ShowGroupPanel = false;
		this.gridColumn1.Caption = "Agent Name";
		this.gridColumn1.FieldName = "AgentName";
		this.gridColumn1.Name = "gridColumn1";
		this.gridColumn1.Visible = true;
		this.gridColumn1.VisibleIndex = 0;
		this.gridColumn2.Caption = "Guide Name";
		this.gridColumn2.FieldName = "GuideName";
		this.gridColumn2.Name = "gridColumn2";
		this.gridColumn2.Visible = true;
		this.gridColumn2.VisibleIndex = 1;
		this.gridColumn3.Caption = "Tel Guide";
		this.gridColumn3.FieldName = "TelGuide";
		this.gridColumn3.Name = "gridColumn3";
		this.gridColumn3.Visible = true;
		this.gridColumn3.VisibleIndex = 2;
		this.gridColumn4.Caption = "PartyCode";
		this.gridColumn4.FieldName = "PartyCode";
		this.gridColumn4.Name = "gridColumn4";
		this.gridColumn4.Visible = true;
		this.gridColumn4.VisibleIndex = 3;
		this.gridColumn5.Caption = "Pax";
		this.gridColumn5.FieldName = "Pax";
		this.gridColumn5.Name = "gridColumn5";
		this.gridColumn5.Visible = true;
		this.gridColumn5.VisibleIndex = 4;
		this.gridColumn6.Caption = "Car Code";
		this.gridColumn6.FieldName = "CarCode";
		this.gridColumn6.Name = "gridColumn6";
		this.gridColumn6.Visible = true;
		this.gridColumn6.VisibleIndex = 5;
		this.gridColumn7.Caption = "Arrive Date";
		this.gridColumn7.FieldName = "ArriveDate";
		this.gridColumn7.Name = "gridColumn7";
		this.gridColumn7.Visible = true;
		this.gridColumn7.VisibleIndex = 6;
		this.gridColumn8.Caption = "Departure Date";
		this.gridColumn8.FieldName = "DepartureDate";
		this.gridColumn8.Name = "gridColumn8";
		this.gridColumn8.Visible = true;
		this.gridColumn8.VisibleIndex = 7;
		this.gridColumn9.Caption = "Nation";
		this.gridColumn9.FieldName = "NationCode";
		this.gridColumn9.Name = "gridColumn9";
		this.gridColumn9.Visible = true;
		this.gridColumn9.VisibleIndex = 8;
		this.gridColumn10.Caption = "Order Date";
		this.gridColumn10.FieldName = "OrderDate_Ref";
		this.gridColumn10.Name = "gridColumn10";
		this.gridColumn10.Visible = true;
		this.gridColumn10.VisibleIndex = 9;
		this.gridColumn11.Caption = "Fax No";
		this.gridColumn11.FieldName = "FaxNo_Ref";
		this.gridColumn11.Name = "gridColumn11";
		this.gridColumn11.Visible = true;
		this.gridColumn11.VisibleIndex = 10;
		this.gridColumn12.Caption = "AgentCode Ref";
		this.gridColumn12.FieldName = "AgentCode_Ref";
		this.gridColumn12.Name = "gridColumn12";
		this.gridColumn12.Visible = true;
		this.gridColumn12.VisibleIndex = 11;
		this.gridColumn13.Caption = "PartyCode Ref";
		this.gridColumn13.FieldName = "PartyCode_Ref";
		this.gridColumn13.Name = "gridColumn13";
		this.gridColumn13.Visible = true;
		this.gridColumn13.VisibleIndex = 12;
		this.gridColumn14.Caption = "Remark Book";
		this.gridColumn14.FieldName = "Remark_Book";
		this.gridColumn14.Name = "gridColumn14";
		this.gridColumn14.Visible = true;
		this.gridColumn14.VisibleIndex = 13;
		this.gridColumn22.Caption = "Complete";
		this.gridColumn22.ColumnEdit = this.repositoryItemImageComboBox1;
		this.gridColumn22.FieldName = "Complete";
		this.gridColumn22.Name = "gridColumn22";
		this.repositoryItemImageComboBox1.AutoHeight = false;
		this.repositoryItemImageComboBox1.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repositoryItemImageComboBox1.Items.AddRange(new DevExpress.XtraEditors.Controls.ImageComboBoxItem[2]
		{
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("", "Y", 0),
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("", "N", 1)
		});
		this.repositoryItemImageComboBox1.Name = "repositoryItemImageComboBox1";
		this.repositoryItemImageComboBox1.SmallImages = this.image16x16;
		this.image16x16.ImageStream = (DevExpress.Utils.ImageCollectionStreamer)resources.GetObject("image16x16.ImageStream");
		this.image16x16.InsertGalleryImage("apply_16x16.png", "images/actions/apply_16x16.png", DevExpress.Images.ImageResourceCache.Default.GetImage("images/actions/apply_16x16.png"), 0);
		this.image16x16.Images.SetKeyName(0, "apply_16x16.png");
		this.image16x16.InsertGalleryImage("cancel_16x16.png", "images/actions/cancel_16x16.png", DevExpress.Images.ImageResourceCache.Default.GetImage("images/actions/cancel_16x16.png"), 1);
		this.image16x16.Images.SetKeyName(1, "cancel_16x16.png");
		this.xtraTabPage2.Controls.Add(this.gridControl2);
		this.xtraTabPage2.Image = (System.Drawing.Image)resources.GetObject("xtraTabPage2.Image");
		this.xtraTabPage2.Name = "xtraTabPage2";
		this.xtraTabPage2.Size = new System.Drawing.Size(924, 288);
		this.xtraTabPage2.Text = "Detail";
		this.gridControl2.Dock = System.Windows.Forms.DockStyle.Fill;
		this.gridControl2.Location = new System.Drawing.Point(0, 0);
		this.gridControl2.MainView = this.gridView2;
		this.gridControl2.MenuManager = this.barManager1;
		this.gridControl2.Name = "gridControl2";
		this.gridControl2.Size = new System.Drawing.Size(924, 288);
		this.gridControl2.TabIndex = 3;
		this.gridControl2.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView2 });
		this.gridView2.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[7] { this.gridColumn15, this.gridColumn16, this.gridColumn17, this.gridColumn18, this.gridColumn19, this.gridColumn20, this.gridColumn21 });
		this.gridView2.GridControl = this.gridControl2;
		this.gridView2.Name = "gridView2";
		this.gridView2.OptionsBehavior.Editable = false;
		this.gridView2.OptionsCustomization.AllowColumnMoving = false;
		this.gridView2.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView2.OptionsView.ShowGroupPanel = false;
		this.gridColumn15.Caption = "Order Date";
		this.gridColumn15.FieldName = "Order_Date";
		this.gridColumn15.Name = "gridColumn15";
		this.gridColumn15.Visible = true;
		this.gridColumn15.VisibleIndex = 0;
		this.gridColumn16.Caption = "Fax No";
		this.gridColumn16.FieldName = "Fax_No";
		this.gridColumn16.Name = "gridColumn16";
		this.gridColumn16.Visible = true;
		this.gridColumn16.VisibleIndex = 1;
		this.gridColumn17.Caption = "Agent Code";
		this.gridColumn17.FieldName = "Agent_Code";
		this.gridColumn17.Name = "gridColumn17";
		this.gridColumn17.Visible = true;
		this.gridColumn17.VisibleIndex = 2;
		this.gridColumn18.Caption = "Code";
		this.gridColumn18.FieldName = "Code";
		this.gridColumn18.Name = "gridColumn18";
		this.gridColumn18.Visible = true;
		this.gridColumn18.VisibleIndex = 3;
		this.gridColumn19.Caption = "Place";
		this.gridColumn19.FieldName = "Place_Code";
		this.gridColumn19.Name = "gridColumn19";
		this.gridColumn19.Visible = true;
		this.gridColumn19.VisibleIndex = 4;
		this.gridColumn20.Caption = "Start Date";
		this.gridColumn20.FieldName = "Start_Date";
		this.gridColumn20.Name = "gridColumn20";
		this.gridColumn20.Visible = true;
		this.gridColumn20.VisibleIndex = 5;
		this.gridColumn21.Caption = "End Date";
		this.gridColumn21.FieldName = "End_Date";
		this.gridColumn21.Name = "gridColumn21";
		this.gridColumn21.Visible = true;
		this.gridColumn21.VisibleIndex = 6;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(926, 450);
		base.Controls.Add(this.xtraTabControl1);
		base.Controls.Add(this.panelControl1);
		base.Controls.Add(this.barDockControlLeft);
		base.Controls.Add(this.barDockControlRight);
		base.Controls.Add(this.barDockControlBottom);
		base.Controls.Add(this.barDockControlTop);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "FrmDeleteFromImport";
		base.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
		this.Text = "Delete DB From Import";
		base.WindowState = System.Windows.Forms.FormWindowState.Maximized;
		((System.ComponentModel.ISupportInitialize)this.barManager1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.panelControl1).EndInit();
		this.panelControl1.ResumeLayout(false);
		this.panelControl1.PerformLayout();
		((System.ComponentModel.ISupportInitialize)this.LookupEditSeriesNo.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.xtraTabControl1).EndInit();
		this.xtraTabControl1.ResumeLayout(false);
		this.xtraTabPage1.ResumeLayout(false);
		((System.ComponentModel.ISupportInitialize)this.gridControl1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.image16x16).EndInit();
		this.xtraTabPage2.ResumeLayout(false);
		((System.ComponentModel.ISupportInitialize)this.gridControl2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView2).EndInit();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
