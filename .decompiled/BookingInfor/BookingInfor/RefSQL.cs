using System;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Windows.Forms;
using BookingInfor.DB;
using DevExpress.XtraBars;
using DevExpress.XtraEditors;
using DevExpress.XtraGrid;
using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;

namespace BookingInfor;

public class RefSQL : XtraForm
{
	private const int CP_NOCLOSE_BUTTON = 512;

	private IContainer components = null;

	private BarManager barManager1;

	private Bar bar1;

	private Bar bar3;

	private BarDockControl barDockControlTop;

	private BarDockControl barDockControlBottom;

	private BarDockControl barDockControlLeft;

	private BarDockControl barDockControlRight;

	private BarLargeButtonItem btnOK;

	private BarStaticItem barStaticItem1;

	private BarLargeButtonItem btnCancel;

	private GridControl gridControl1;

	private GridView gridView1;

	private BarLargeButtonItem btnFindGrid;

	private BarStaticItem barStaticItem3;

	protected override CreateParams CreateParams
	{
		get
		{
			CreateParams createParams = base.CreateParams;
			createParams.ClassStyle |= 512;
			return createParams;
		}
	}

	public RefSQL()
	{
		InitializeComponent();
		ShowData();
		if (gridView1.DataRowCount == 0)
		{
			base.DialogResult = DialogResult.Cancel;
		}
	}

	private void ShowData()
	{
		DataTable dataTable = DAL.ExecuteQueryReturnDataTable(DAL.StringConnection, ParaClass.rRefFields);
		if (dataTable == null || dataTable.Rows.Count == 0)
		{
			MessageBox.Show("ไม\u0e48ม\u0e35ข\u0e49อม\u0e39ล");
			ParaClass.rRef = "";
		}
		else
		{
			BindData(dataTable);
		}
	}

	private void BindData(DataTable dt)
	{
		gridControl1.BeginUpdate();
		gridControl1.DataSource = null;
		gridControl1.DataSource = dt;
		gridView1.BestFitColumns();
		gridControl1.EndUpdate();
	}

	private void btnCancel_ItemClick(object sender, ItemClickEventArgs e)
	{
		MessageBox.Show("ไม\u0e48ได\u0e49เล\u0e37อกข\u0e49อม\u0e39ล");
		ParaClass.rRef = "";
		base.DialogResult = DialogResult.Cancel;
	}

	private void RowSelectX()
	{
		if (gridView1.DataRowCount == 0)
		{
			MessageBox.Show("ไม\u0e48ม\u0e35ข\u0e49อม\u0e39ลท\u0e35\u0e48อ\u0e49างอ\u0e34ง");
			ParaClass.rRef = "";
			ParaClass.rRef2 = "";
			base.DialogResult = DialogResult.Cancel;
		}
		string text = "";
		string text2 = "";
		ParaClass.rRef2 = "";
		string text3 = ParaClass.rRef;
		while (text3.Length > 0)
		{
			if (text3.IndexOf(",") > 0)
			{
				text2 = StCl.MT.MidPart(text3, ",", 1);
				text3 = StCl.MT.RightPart(text3, ",");
			}
			else
			{
				text2 = text3;
				text3 = "";
				ParaClass.rRef = "";
			}
			if (text.Length > 0)
			{
				text += ",";
			}
			if (ParaClass.rRef2.Length > 0)
			{
				ParaClass.rRef2 += "~";
			}
			string text4 = "";
			DataRow dataRow = gridView1.GetDataRow(gridView1.FocusedRowHandle);
			text4 = Util.GetStringValue(dataRow, text2);
			text += text4;
			ParaClass.rRef2 += text4;
		}
		ParaClass.rRef = text;
		base.DialogResult = DialogResult.OK;
	}

	private void btnOK_ItemClick(object sender, ItemClickEventArgs e)
	{
		RowSelectX();
	}

	private void gridView1_DoubleClick(object sender, EventArgs e)
	{
		RowSelectX();
	}

	private void gridView1_KeyDown(object sender, KeyEventArgs e)
	{
		if (e.KeyCode == Keys.Return)
		{
			RowSelectX();
		}
	}

	private void btnSearch_ItemClick(object sender, ItemClickEventArgs e)
	{
	}

	private void btnFindGrid_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.IsFindPanelVisible)
		{
			gridView1.HideFindPanel();
		}
		else
		{
			gridView1.ShowFindPanel();
		}
	}

	private void RefSQL_FormClosing(object sender, FormClosingEventArgs e)
	{
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BookingInfor.RefSQL));
		this.barManager1 = new DevExpress.XtraBars.BarManager();
		this.bar1 = new DevExpress.XtraBars.Bar();
		this.btnOK = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem1 = new DevExpress.XtraBars.BarStaticItem();
		this.btnCancel = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem3 = new DevExpress.XtraBars.BarStaticItem();
		this.btnFindGrid = new DevExpress.XtraBars.BarLargeButtonItem();
		this.bar3 = new DevExpress.XtraBars.Bar();
		this.barDockControlTop = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlBottom = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlLeft = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlRight = new DevExpress.XtraBars.BarDockControl();
		this.gridControl1 = new DevExpress.XtraGrid.GridControl();
		this.gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
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
		this.barManager1.Items.AddRange(new DevExpress.XtraBars.BarItem[5] { this.btnOK, this.barStaticItem1, this.btnCancel, this.btnFindGrid, this.barStaticItem3 });
		this.barManager1.MaxItemId = 7;
		this.barManager1.StatusBar = this.bar3;
		this.bar1.BarName = "Tools";
		this.bar1.DockCol = 0;
		this.bar1.DockRow = 0;
		this.bar1.DockStyle = DevExpress.XtraBars.BarDockStyle.Top;
		this.bar1.LinksPersistInfo.AddRange(new DevExpress.XtraBars.LinkPersistInfo[5]
		{
			new DevExpress.XtraBars.LinkPersistInfo(this.btnOK),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem1),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnCancel),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem3),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnFindGrid)
		});
		this.bar1.OptionsBar.DrawBorder = false;
		this.bar1.OptionsBar.DrawDragBorder = false;
		this.bar1.Text = "Tools";
		this.btnOK.Caption = "OK";
		this.btnOK.Glyph = (System.Drawing.Image)resources.GetObject("btnOK.Glyph");
		this.btnOK.Id = 0;
		this.btnOK.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnOK.LargeGlyph");
		this.btnOK.LargeImageIndex = 0;
		this.btnOK.Name = "btnOK";
		this.btnOK.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnOK_ItemClick);
		this.barStaticItem1.Id = 1;
		this.barStaticItem1.Name = "barStaticItem1";
		this.barStaticItem1.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnCancel.Caption = "Cancel";
		this.btnCancel.Glyph = (System.Drawing.Image)resources.GetObject("btnCancel.Glyph");
		this.btnCancel.Id = 2;
		this.btnCancel.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnCancel.LargeGlyph");
		this.btnCancel.LargeImageIndex = 1;
		this.btnCancel.Name = "btnCancel";
		this.btnCancel.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnCancel_ItemClick);
		this.barStaticItem3.Id = 6;
		this.barStaticItem3.Name = "barStaticItem3";
		this.barStaticItem3.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnFindGrid.Caption = "Find in Grid";
		this.btnFindGrid.Glyph = (System.Drawing.Image)resources.GetObject("btnFindGrid.Glyph");
		this.btnFindGrid.Id = 5;
		this.btnFindGrid.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnFindGrid.LargeGlyph");
		this.btnFindGrid.LargeImageIndex = 2;
		this.btnFindGrid.Name = "btnFindGrid";
		this.btnFindGrid.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnFindGrid_ItemClick);
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
		this.barDockControlTop.Size = new System.Drawing.Size(794, 60);
		this.barDockControlBottom.CausesValidation = false;
		this.barDockControlBottom.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.barDockControlBottom.Location = new System.Drawing.Point(0, 366);
		this.barDockControlBottom.Size = new System.Drawing.Size(794, 22);
		this.barDockControlLeft.CausesValidation = false;
		this.barDockControlLeft.Dock = System.Windows.Forms.DockStyle.Left;
		this.barDockControlLeft.Location = new System.Drawing.Point(0, 60);
		this.barDockControlLeft.Size = new System.Drawing.Size(0, 306);
		this.barDockControlRight.CausesValidation = false;
		this.barDockControlRight.Dock = System.Windows.Forms.DockStyle.Right;
		this.barDockControlRight.Location = new System.Drawing.Point(794, 60);
		this.barDockControlRight.Size = new System.Drawing.Size(0, 306);
		this.gridControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.gridControl1.Location = new System.Drawing.Point(0, 60);
		this.gridControl1.MainView = this.gridView1;
		this.gridControl1.MenuManager = this.barManager1;
		this.gridControl1.Name = "gridControl1";
		this.gridControl1.Size = new System.Drawing.Size(794, 306);
		this.gridControl1.TabIndex = 4;
		this.gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView1 });
		this.gridView1.GridControl = this.gridControl1;
		this.gridView1.Name = "gridView1";
		this.gridView1.OptionsBehavior.Editable = false;
		this.gridView1.OptionsCustomization.AllowColumnMoving = false;
		this.gridView1.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView1.OptionsView.ShowGroupPanel = false;
		this.gridView1.KeyDown += new System.Windows.Forms.KeyEventHandler(gridView1_KeyDown);
		this.gridView1.DoubleClick += new System.EventHandler(gridView1_DoubleClick);
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(794, 388);
		base.Controls.Add(this.gridControl1);
		base.Controls.Add(this.barDockControlLeft);
		base.Controls.Add(this.barDockControlRight);
		base.Controls.Add(this.barDockControlBottom);
		base.Controls.Add(this.barDockControlTop);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "RefSQL";
		base.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
		this.Text = "Reference";
		base.FormClosing += new System.Windows.Forms.FormClosingEventHandler(RefSQL_FormClosing);
		((System.ComponentModel.ISupportInitialize)this.barManager1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).EndInit();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
