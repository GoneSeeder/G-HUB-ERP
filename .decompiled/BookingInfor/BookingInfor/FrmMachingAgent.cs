using System;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Windows.Forms;
using BookingInfor.DB;
using DevExpress.XtraBars;
using DevExpress.XtraEditors;
using DevExpress.XtraGrid;
using DevExpress.XtraGrid.Columns;
using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;

namespace BookingInfor;

public class FrmMachingAgent : XtraForm
{
	private IContainer components = null;

	private BarManager barManager1;

	private Bar bar1;

	private BarLargeButtonItem btnEdit;

	private Bar bar3;

	private BarDockControl barDockControlTop;

	private BarDockControl barDockControlBottom;

	private BarDockControl barDockControlLeft;

	private BarDockControl barDockControlRight;

	private BarLargeButtonItem btnRefresh;

	private GridControl gridControl1;

	private GridView gridView1;

	private GridColumn gridColumn1;

	private GridColumn gridColumn2;

	private GridColumn gridColumn3;

	private GridColumn gridColumn4;

	private BarStaticItem barStaticItem1;

	private BarLargeButtonItem btnAdd;

	private BarStaticItem barStaticItem2;

	private BarLargeButtonItem btnDelete;

	private BarStaticItem barStaticItem3;

	public FrmMachingAgent()
	{
		InitializeComponent();
		InitPage();
	}

	private void InitPage()
	{
		ShowData();
	}

	private void ShowData()
	{
		int focusedRowHandle = gridView1.FocusedRowHandle;
		DataTable dataAgentMatching = DataSQL.GetDataAgentMatching();
		BindData(gridControl1, dataAgentMatching);
		gridView1.BestFitColumns();
		Util.SetFocusRow(gridView1, focusedRowHandle);
	}

	private void BindData(GridControl gridControl, DataTable dt)
	{
		gridControl.BeginUpdate();
		gridControl.DataSource = null;
		gridControl.DataSource = dt;
		gridControl.EndUpdate();
	}

	private void btnEdit_ItemClick(object sender, ItemClickEventArgs e)
	{
		Edit();
	}

	private void Edit()
	{
		if (gridView1.DataRowCount != 0)
		{
			int focusedRowHandle = gridView1.FocusedRowHandle;
			DataRow dataRow = gridView1.GetDataRow(focusedRowHandle);
			FrmMachingAgentDetail frmMachingAgentDetail = new FrmMachingAgentDetail(dataRow, "Edit");
			frmMachingAgentDetail.ShowInTaskbar = false;
			DialogResult dialogResult = frmMachingAgentDetail.ShowDialog();
			if (dialogResult == DialogResult.OK || dialogResult == DialogResult.Cancel)
			{
				ShowData();
				Util.SetFocusRow(gridView1, focusedRowHandle);
			}
		}
	}

	private void gridView1_DoubleClick(object sender, EventArgs e)
	{
		Edit();
	}

	private void btnAdd_ItemClick(object sender, ItemClickEventArgs e)
	{
		int focusedRowHandle = gridView1.FocusedRowHandle;
		FrmMachingAgentDetail frmMachingAgentDetail = new FrmMachingAgentDetail(null, "AddNew");
		frmMachingAgentDetail.ShowInTaskbar = false;
		DialogResult dialogResult = frmMachingAgentDetail.ShowDialog();
		if (dialogResult == DialogResult.OK || dialogResult == DialogResult.Cancel)
		{
			ShowData();
			Util.SetFocusRow(gridView1, focusedRowHandle);
		}
	}

	private void btnDelete_ItemClick(object sender, ItemClickEventArgs e)
	{
		int focusedRowHandle = gridView1.FocusedRowHandle;
		DataRow dataRow = gridView1.GetDataRow(focusedRowHandle);
		FrmMachingAgentDetail frmMachingAgentDetail = new FrmMachingAgentDetail(dataRow, "Delete");
		frmMachingAgentDetail.ShowInTaskbar = false;
		DialogResult dialogResult = frmMachingAgentDetail.ShowDialog();
		if (dialogResult == DialogResult.OK || dialogResult == DialogResult.Cancel)
		{
			ShowData();
			Util.SetFocusRow(gridView1, focusedRowHandle);
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BookingInfor.FrmMachingAgent));
		this.barManager1 = new DevExpress.XtraBars.BarManager(this.components);
		this.bar1 = new DevExpress.XtraBars.Bar();
		this.btnEdit = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem1 = new DevExpress.XtraBars.BarStaticItem();
		this.btnAdd = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem2 = new DevExpress.XtraBars.BarStaticItem();
		this.btnRefresh = new DevExpress.XtraBars.BarLargeButtonItem();
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
		this.btnDelete = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem3 = new DevExpress.XtraBars.BarStaticItem();
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
		this.barManager1.Items.AddRange(new DevExpress.XtraBars.BarItem[7] { this.btnEdit, this.btnRefresh, this.barStaticItem1, this.btnAdd, this.barStaticItem2, this.btnDelete, this.barStaticItem3 });
		this.barManager1.MaxItemId = 8;
		this.barManager1.StatusBar = this.bar3;
		this.bar1.BarName = "Tools";
		this.bar1.DockCol = 0;
		this.bar1.DockRow = 0;
		this.bar1.DockStyle = DevExpress.XtraBars.BarDockStyle.Top;
		this.bar1.LinksPersistInfo.AddRange(new DevExpress.XtraBars.LinkPersistInfo[7]
		{
			new DevExpress.XtraBars.LinkPersistInfo(this.btnEdit),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem1),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnAdd),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem2),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnDelete),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem3),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnRefresh)
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
		this.barStaticItem1.Id = 2;
		this.barStaticItem1.Name = "barStaticItem1";
		this.barStaticItem1.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnAdd.Caption = "Add";
		this.btnAdd.Glyph = (System.Drawing.Image)resources.GetObject("btnAdd.Glyph");
		this.btnAdd.Id = 3;
		this.btnAdd.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnAdd.LargeGlyph");
		this.btnAdd.Name = "btnAdd";
		this.btnAdd.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnAdd_ItemClick);
		this.barStaticItem2.Id = 4;
		this.barStaticItem2.Name = "barStaticItem2";
		this.barStaticItem2.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnRefresh.Caption = "Refresh";
		this.btnRefresh.Glyph = (System.Drawing.Image)resources.GetObject("btnRefresh.Glyph");
		this.btnRefresh.Id = 1;
		this.btnRefresh.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnRefresh.LargeGlyph");
		this.btnRefresh.Name = "btnRefresh";
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
		this.barDockControlTop.Size = new System.Drawing.Size(958, 60);
		this.barDockControlBottom.CausesValidation = false;
		this.barDockControlBottom.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.barDockControlBottom.Location = new System.Drawing.Point(0, 505);
		this.barDockControlBottom.Size = new System.Drawing.Size(958, 22);
		this.barDockControlLeft.CausesValidation = false;
		this.barDockControlLeft.Dock = System.Windows.Forms.DockStyle.Left;
		this.barDockControlLeft.Location = new System.Drawing.Point(0, 60);
		this.barDockControlLeft.Size = new System.Drawing.Size(0, 445);
		this.barDockControlRight.CausesValidation = false;
		this.barDockControlRight.Dock = System.Windows.Forms.DockStyle.Right;
		this.barDockControlRight.Location = new System.Drawing.Point(958, 60);
		this.barDockControlRight.Size = new System.Drawing.Size(0, 445);
		this.gridControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.gridControl1.Location = new System.Drawing.Point(0, 60);
		this.gridControl1.MainView = this.gridView1;
		this.gridControl1.MenuManager = this.barManager1;
		this.gridControl1.Name = "gridControl1";
		this.gridControl1.Size = new System.Drawing.Size(958, 445);
		this.gridControl1.TabIndex = 4;
		this.gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView1 });
		this.gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[4] { this.gridColumn1, this.gridColumn2, this.gridColumn3, this.gridColumn4 });
		this.gridView1.GridControl = this.gridControl1;
		this.gridView1.Name = "gridView1";
		this.gridView1.OptionsBehavior.Editable = false;
		this.gridView1.OptionsCustomization.AllowColumnMoving = false;
		this.gridView1.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView1.OptionsView.ShowGroupPanel = false;
		this.gridView1.DoubleClick += new System.EventHandler(gridView1_DoubleClick);
		this.gridColumn1.Caption = "Agent Code Ref";
		this.gridColumn1.FieldName = "AgentCodeRef";
		this.gridColumn1.Name = "gridColumn1";
		this.gridColumn1.Visible = true;
		this.gridColumn1.VisibleIndex = 0;
		this.gridColumn2.Caption = "Agent Name Ref";
		this.gridColumn2.FieldName = "AgentNameRef";
		this.gridColumn2.Name = "gridColumn2";
		this.gridColumn2.Visible = true;
		this.gridColumn2.VisibleIndex = 1;
		this.gridColumn3.Caption = "Agent Code";
		this.gridColumn3.FieldName = "AgentCode";
		this.gridColumn3.Name = "gridColumn3";
		this.gridColumn3.Visible = true;
		this.gridColumn3.VisibleIndex = 2;
		this.gridColumn4.Caption = "Agent Name";
		this.gridColumn4.FieldName = "AgentName";
		this.gridColumn4.Name = "gridColumn4";
		this.gridColumn4.Visible = true;
		this.gridColumn4.VisibleIndex = 3;
		this.btnDelete.Caption = "Delete";
		this.btnDelete.Glyph = (System.Drawing.Image)resources.GetObject("btnDelete.Glyph");
		this.btnDelete.Id = 6;
		this.btnDelete.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnDelete.LargeGlyph");
		this.btnDelete.Name = "btnDelete";
		this.btnDelete.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnDelete_ItemClick);
		this.barStaticItem3.Id = 7;
		this.barStaticItem3.Name = "barStaticItem3";
		this.barStaticItem3.TextAlignment = System.Drawing.StringAlignment.Near;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(958, 527);
		base.Controls.Add(this.gridControl1);
		base.Controls.Add(this.barDockControlLeft);
		base.Controls.Add(this.barDockControlRight);
		base.Controls.Add(this.barDockControlBottom);
		base.Controls.Add(this.barDockControlTop);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "FrmMachingAgent";
		base.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
		this.Text = "Agent Maching";
		((System.ComponentModel.ISupportInitialize)this.barManager1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).EndInit();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
