using System;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Windows.Forms;
using BookingInfor.DB;
using DevExpress.Utils;
using DevExpress.XtraBars;
using DevExpress.XtraEditors;
using DevExpress.XtraEditors.Controls;
using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraLayout;

namespace BookingInfor;

public class FrmMachingAgentDetail : XtraForm
{
	private DataRow _row;

	private string _rType;

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

	private TextEdit txtAgentCodeRef;

	private TextEdit txtAgentNameRef;

	private TextEdit txtAgentName;

	private LayoutControlItem layoutControlItem1;

	private LayoutControlItem layoutControlItem2;

	private LayoutControlItem layoutControlItem4;

	private SearchLookUpEdit searchLookUpEdit1;

	private GridView searchLookUpEdit1View;

	private LayoutControlItem layoutControlItem5;

	private BarLargeButtonItem btnDelete;

	public bool isEdit { get; set; }

	public FrmMachingAgentDetail()
	{
		InitializeComponent();
		InitPage();
	}

	public FrmMachingAgentDetail(DataRow row, string rType)
	{
		InitializeComponent();
		_row = row;
		_rType = rType;
		InitPage();
	}

	private void InitPage()
	{
		InitLoadData();
		if (_rType == "AddNew")
		{
			txtAgentCodeRef.Enabled = true;
		}
		else
		{
			txtAgentCodeRef.Enabled = false;
		}
		if (_rType == "Delete")
		{
			searchLookUpEdit1.Enabled = false;
			btnSave.Visibility = BarItemVisibility.Never;
			btnDelete.Visibility = BarItemVisibility.Always;
		}
		else
		{
			searchLookUpEdit1.Enabled = true;
			btnSave.Visibility = BarItemVisibility.Always;
			btnDelete.Visibility = BarItemVisibility.Never;
		}
		txtAgentNameRef.Enabled = false;
		txtAgentName.Enabled = false;
		searchLookUpEdit1.Properties.ValueMember = "Code";
		searchLookUpEdit1.Properties.DisplayMember = "Code";
		ClearScreen();
		ShowData();
	}

	private void InitLoadData()
	{
		searchLookUpEdit1.Properties.BeginUpdate();
		searchLookUpEdit1.Properties.DataSource = null;
		searchLookUpEdit1.Properties.DataSource = DataSQL.GetListAgent();
		searchLookUpEdit1.Properties.EndUpdate();
	}

	private void ClearScreen()
	{
		txtAgentCodeRef.Text = "";
		txtAgentNameRef.Text = "";
		txtAgentName.Text = "";
	}

	private void ShowData()
	{
		if (_row != null)
		{
			txtAgentCodeRef.Text = _row["AgentCodeRef"].ToString();
			txtAgentNameRef.Text = _row["AgentNameRef"].ToString();
			searchLookUpEdit1.EditValue = _row["AgentCode"].ToString();
			txtAgentName.Text = _row["AgentName"].ToString();
		}
	}

	private void btnCancel_ItemClick(object sender, ItemClickEventArgs e)
	{
		base.DialogResult = DialogResult.Cancel;
	}

	private void searchLookUpEdit1_EditValueChanged(object sender, EventArgs e)
	{
		if (searchLookUpEdit1.EditValue != null)
		{
			string agentCode = searchLookUpEdit1.EditValue.ToString();
			txtAgentName.Text = DataSQL.GetAgentName(agentCode);
		}
		else
		{
			txtAgentName.Text = null;
		}
	}

	private void btnSave_ItemClick(object sender, ItemClickEventArgs e)
	{
		string agentCodeRef = txtAgentCodeRef.Text;
		string agentCode = "";
		if (searchLookUpEdit1.EditValue != null)
		{
			agentCode = searchLookUpEdit1.EditValue.ToString();
		}
		DataSQL.SaveAgentMatching(agentCodeRef, agentCode);
		base.DialogResult = DialogResult.OK;
	}

	private void btnDelete_ItemClick(object sender, ItemClickEventArgs e)
	{
		string agentCodeRef = txtAgentCodeRef.Text;
		DataSQL.DeleteAgentMatching(agentCodeRef);
		base.DialogResult = DialogResult.OK;
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BookingInfor.FrmMachingAgentDetail));
		this.barManager1 = new DevExpress.XtraBars.BarManager(this.components);
		this.bar1 = new DevExpress.XtraBars.Bar();
		this.btnSave = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem1 = new DevExpress.XtraBars.BarStaticItem();
		this.btnCancel = new DevExpress.XtraBars.BarLargeButtonItem();
		this.bar3 = new DevExpress.XtraBars.Bar();
		this.barDockControlTop = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlBottom = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlLeft = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlRight = new DevExpress.XtraBars.BarDockControl();
		this.layoutControl1 = new DevExpress.XtraLayout.LayoutControl();
		this.searchLookUpEdit1 = new DevExpress.XtraEditors.SearchLookUpEdit();
		this.searchLookUpEdit1View = new DevExpress.XtraGrid.Views.Grid.GridView();
		this.txtAgentCodeRef = new DevExpress.XtraEditors.TextEdit();
		this.txtAgentNameRef = new DevExpress.XtraEditors.TextEdit();
		this.txtAgentName = new DevExpress.XtraEditors.TextEdit();
		this.layoutControlGroup1 = new DevExpress.XtraLayout.LayoutControlGroup();
		this.layoutControlItem1 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem2 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem4 = new DevExpress.XtraLayout.LayoutControlItem();
		this.layoutControlItem5 = new DevExpress.XtraLayout.LayoutControlItem();
		this.btnDelete = new DevExpress.XtraBars.BarLargeButtonItem();
		((System.ComponentModel.ISupportInitialize)this.barManager1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControl1).BeginInit();
		this.layoutControl1.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.searchLookUpEdit1.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.searchLookUpEdit1View).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentCodeRef.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentNameRef.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentName.Properties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem4).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem5).BeginInit();
		base.SuspendLayout();
		this.barManager1.Bars.AddRange(new DevExpress.XtraBars.Bar[2] { this.bar1, this.bar3 });
		this.barManager1.DockControls.Add(this.barDockControlTop);
		this.barManager1.DockControls.Add(this.barDockControlBottom);
		this.barManager1.DockControls.Add(this.barDockControlLeft);
		this.barManager1.DockControls.Add(this.barDockControlRight);
		this.barManager1.Form = this;
		this.barManager1.Items.AddRange(new DevExpress.XtraBars.BarItem[4] { this.btnSave, this.btnCancel, this.barStaticItem1, this.btnDelete });
		this.barManager1.MaxItemId = 5;
		this.barManager1.StatusBar = this.bar3;
		this.bar1.BarName = "Tools";
		this.bar1.DockCol = 0;
		this.bar1.DockRow = 0;
		this.bar1.DockStyle = DevExpress.XtraBars.BarDockStyle.Top;
		this.bar1.LinksPersistInfo.AddRange(new DevExpress.XtraBars.LinkPersistInfo[4]
		{
			new DevExpress.XtraBars.LinkPersistInfo(this.btnSave),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnDelete),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem1),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnCancel)
		});
		this.bar1.OptionsBar.DrawBorder = false;
		this.bar1.OptionsBar.DrawDragBorder = false;
		this.bar1.Text = "Tools";
		this.btnSave.Caption = "Save";
		this.btnSave.Glyph = (System.Drawing.Image)resources.GetObject("btnSave.Glyph");
		this.btnSave.Id = 0;
		this.btnSave.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnSave.LargeGlyph");
		this.btnSave.Name = "btnSave";
		this.btnSave.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnSave_ItemClick);
		this.barStaticItem1.Id = 2;
		this.barStaticItem1.Name = "barStaticItem1";
		this.barStaticItem1.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnCancel.Caption = "Cancel";
		this.btnCancel.Glyph = (System.Drawing.Image)resources.GetObject("btnCancel.Glyph");
		this.btnCancel.Id = 1;
		this.btnCancel.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnCancel.LargeGlyph");
		this.btnCancel.Name = "btnCancel";
		this.btnCancel.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnCancel_ItemClick);
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
		this.barDockControlTop.Size = new System.Drawing.Size(654, 60);
		this.barDockControlBottom.CausesValidation = false;
		this.barDockControlBottom.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.barDockControlBottom.Location = new System.Drawing.Point(0, 163);
		this.barDockControlBottom.Size = new System.Drawing.Size(654, 22);
		this.barDockControlLeft.CausesValidation = false;
		this.barDockControlLeft.Dock = System.Windows.Forms.DockStyle.Left;
		this.barDockControlLeft.Location = new System.Drawing.Point(0, 60);
		this.barDockControlLeft.Size = new System.Drawing.Size(0, 103);
		this.barDockControlRight.CausesValidation = false;
		this.barDockControlRight.Dock = System.Windows.Forms.DockStyle.Right;
		this.barDockControlRight.Location = new System.Drawing.Point(654, 60);
		this.barDockControlRight.Size = new System.Drawing.Size(0, 103);
		this.layoutControl1.Controls.Add(this.searchLookUpEdit1);
		this.layoutControl1.Controls.Add(this.txtAgentCodeRef);
		this.layoutControl1.Controls.Add(this.txtAgentNameRef);
		this.layoutControl1.Controls.Add(this.txtAgentName);
		this.layoutControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.layoutControl1.Location = new System.Drawing.Point(0, 60);
		this.layoutControl1.Name = "layoutControl1";
		this.layoutControl1.Root = this.layoutControlGroup1;
		this.layoutControl1.Size = new System.Drawing.Size(654, 103);
		this.layoutControl1.TabIndex = 4;
		this.layoutControl1.Text = "layoutControl1";
		this.searchLookUpEdit1.Location = new System.Drawing.Point(93, 36);
		this.searchLookUpEdit1.MenuManager = this.barManager1;
		this.searchLookUpEdit1.Name = "searchLookUpEdit1";
		this.searchLookUpEdit1.Properties.AllowNullInput = DevExpress.Utils.DefaultBoolean.True;
		this.searchLookUpEdit1.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.searchLookUpEdit1.Properties.NullText = "";
		this.searchLookUpEdit1.Properties.View = this.searchLookUpEdit1View;
		this.searchLookUpEdit1.Size = new System.Drawing.Size(151, 20);
		this.searchLookUpEdit1.StyleController = this.layoutControl1;
		this.searchLookUpEdit1.TabIndex = 10;
		this.searchLookUpEdit1.EditValueChanged += new System.EventHandler(searchLookUpEdit1_EditValueChanged);
		this.searchLookUpEdit1View.FocusRectStyle = DevExpress.XtraGrid.Views.Grid.DrawFocusRectStyle.RowFocus;
		this.searchLookUpEdit1View.Name = "searchLookUpEdit1View";
		this.searchLookUpEdit1View.OptionsSelection.EnableAppearanceFocusedCell = false;
		this.searchLookUpEdit1View.OptionsView.ShowGroupPanel = false;
		this.txtAgentCodeRef.Location = new System.Drawing.Point(93, 12);
		this.txtAgentCodeRef.MenuManager = this.barManager1;
		this.txtAgentCodeRef.Name = "txtAgentCodeRef";
		this.txtAgentCodeRef.Size = new System.Drawing.Size(151, 20);
		this.txtAgentCodeRef.StyleController = this.layoutControl1;
		this.txtAgentCodeRef.TabIndex = 9;
		this.txtAgentNameRef.Location = new System.Drawing.Point(248, 12);
		this.txtAgentNameRef.MenuManager = this.barManager1;
		this.txtAgentNameRef.Name = "txtAgentNameRef";
		this.txtAgentNameRef.Size = new System.Drawing.Size(394, 20);
		this.txtAgentNameRef.StyleController = this.layoutControl1;
		this.txtAgentNameRef.TabIndex = 8;
		this.txtAgentName.Location = new System.Drawing.Point(248, 36);
		this.txtAgentName.MenuManager = this.barManager1;
		this.txtAgentName.Name = "txtAgentName";
		this.txtAgentName.Size = new System.Drawing.Size(394, 20);
		this.txtAgentName.StyleController = this.layoutControl1;
		this.txtAgentName.TabIndex = 7;
		this.layoutControlGroup1.EnableIndentsWithoutBorders = DevExpress.Utils.DefaultBoolean.True;
		this.layoutControlGroup1.GroupBordersVisible = false;
		this.layoutControlGroup1.Items.AddRange(new DevExpress.XtraLayout.BaseLayoutItem[4] { this.layoutControlItem1, this.layoutControlItem2, this.layoutControlItem4, this.layoutControlItem5 });
		this.layoutControlGroup1.Location = new System.Drawing.Point(0, 0);
		this.layoutControlGroup1.Name = "layoutControlGroup1";
		this.layoutControlGroup1.Size = new System.Drawing.Size(654, 103);
		this.layoutControlGroup1.TextVisible = false;
		this.layoutControlItem1.Control = this.txtAgentNameRef;
		this.layoutControlItem1.Location = new System.Drawing.Point(236, 0);
		this.layoutControlItem1.Name = "layoutControlItem1";
		this.layoutControlItem1.Size = new System.Drawing.Size(398, 24);
		this.layoutControlItem1.TextSize = new System.Drawing.Size(0, 0);
		this.layoutControlItem1.TextVisible = false;
		this.layoutControlItem2.Control = this.txtAgentCodeRef;
		this.layoutControlItem2.Location = new System.Drawing.Point(0, 0);
		this.layoutControlItem2.Name = "layoutControlItem2";
		this.layoutControlItem2.Size = new System.Drawing.Size(236, 24);
		this.layoutControlItem2.Text = "Agent Code Ref";
		this.layoutControlItem2.TextSize = new System.Drawing.Size(78, 13);
		this.layoutControlItem4.Control = this.txtAgentName;
		this.layoutControlItem4.Location = new System.Drawing.Point(236, 24);
		this.layoutControlItem4.Name = "layoutControlItem4";
		this.layoutControlItem4.Size = new System.Drawing.Size(398, 59);
		this.layoutControlItem4.TextSize = new System.Drawing.Size(0, 0);
		this.layoutControlItem4.TextVisible = false;
		this.layoutControlItem5.Control = this.searchLookUpEdit1;
		this.layoutControlItem5.Location = new System.Drawing.Point(0, 24);
		this.layoutControlItem5.Name = "layoutControlItem5";
		this.layoutControlItem5.Size = new System.Drawing.Size(236, 59);
		this.layoutControlItem5.Text = "Agent Code";
		this.layoutControlItem5.TextSize = new System.Drawing.Size(78, 13);
		this.btnDelete.Caption = "Delete";
		this.btnDelete.Glyph = (System.Drawing.Image)resources.GetObject("btnDelete.Glyph");
		this.btnDelete.Id = 3;
		this.btnDelete.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnDelete.LargeGlyph");
		this.btnDelete.Name = "btnDelete";
		this.btnDelete.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnDelete_ItemClick);
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(654, 185);
		base.Controls.Add(this.layoutControl1);
		base.Controls.Add(this.barDockControlLeft);
		base.Controls.Add(this.barDockControlRight);
		base.Controls.Add(this.barDockControlBottom);
		base.Controls.Add(this.barDockControlTop);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "FrmMachingAgentDetail";
		base.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
		this.Text = "Matching Agent Detail ";
		((System.ComponentModel.ISupportInitialize)this.barManager1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControl1).EndInit();
		this.layoutControl1.ResumeLayout(false);
		((System.ComponentModel.ISupportInitialize)this.searchLookUpEdit1.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.searchLookUpEdit1View).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentCodeRef.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentNameRef.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.txtAgentName.Properties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlGroup1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem4).EndInit();
		((System.ComponentModel.ISupportInitialize)this.layoutControlItem5).EndInit();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
