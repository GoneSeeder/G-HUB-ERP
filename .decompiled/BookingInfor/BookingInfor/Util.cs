using System;
using System.Data;
using System.Drawing;
using System.Windows.Forms;
using DevExpress.Data;
using DevExpress.XtraEditors;
using DevExpress.XtraGrid;
using DevExpress.XtraGrid.Columns;
using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraGrid.Views.Grid.ViewInfo;

namespace BookingInfor;

public static class Util
{
	public class Grid
	{
		private static string nameColStyleSelected = "colStyleSelected";

		public static void AddEventGridViewKeepSelection(GridView gridView, bool disableFocusedRowStyle)
		{
			gridView.MouseDown += GridViewKeppSelection_MouseDown;
			gridView.MouseUp += GridViewKeppSelection_MouseUp;
			gridView.SelectionChanged += GridViewKeppSelection_SelectionChanged;
			if (disableFocusedRowStyle)
			{
				gridView.GridControl.DataSourceChanged += GridViewKeppSelection_DataSourceChanged;
				AddColumnStyleSelected(gridView.GridControl);
				InitColStyleSelected(gridView);
			}
			RefreshStyleSelectedRow(gridView);
		}

		private static void InitColStyleSelected(GridView gridView)
		{
			GridColumn gridColumn = new GridColumn();
			gridColumn.Caption = nameColStyleSelected;
			gridColumn.FieldName = nameColStyleSelected;
			gridColumn.Name = nameColStyleSelected;
			gridColumn.OptionsColumn.AllowEdit = false;
			gridView.Columns.AddRange(new GridColumn[1] { gridColumn });
			StyleFormatCondition styleFormatCondition = new StyleFormatCondition();
			styleFormatCondition.Appearance.BackColor = Color.Lavender;
			styleFormatCondition.Appearance.Options.UseBackColor = true;
			styleFormatCondition.ApplyToRow = true;
			styleFormatCondition.Column = gridColumn;
			styleFormatCondition.Condition = FormatConditionEnum.Equal;
			styleFormatCondition.Value1 = true;
			StyleFormatCondition[] array = new StyleFormatCondition[gridView.FormatConditions.Count];
			for (int i = 0; i < gridView.FormatConditions.Count; i++)
			{
				array[i] = gridView.FormatConditions[i];
			}
			gridView.FormatConditions.Clear();
			gridView.FormatConditions.Add(styleFormatCondition);
			gridView.FormatConditions.AddRange(array);
		}

		private static void GridViewKeppSelection_MouseUp(object sender, MouseEventArgs e)
		{
			GridViewKeepSelection(sender, e, "MouseUp");
		}

		private static void GridViewKeppSelection_MouseDown(object sender, MouseEventArgs e)
		{
			GridViewKeepSelection(sender, e, "MouseDown");
		}

		private static void GridViewKeepSelection(object sender, MouseEventArgs e, string mouseEventType)
		{
			GridView view = (GridView)sender;
			GridHitInfo hi = view.CalcHitInfo(e.Location);
			if (!hi.InRow)
			{
				return;
			}
			try
			{
				if (!(hi.Column.FieldName != "DX$CheckboxSelectorColumn"))
				{
					return;
				}
				int[] selectedRows = view.GetSelectedRows();
				bool isSelected = view.IsRowSelected(hi.RowHandle);
				view.GridControl.BeginInvoke((Action)delegate
				{
					for (int i = 0; i < selectedRows.Length; i++)
					{
						view.SelectRow(selectedRows[i]);
					}
					if (!isSelected)
					{
						view.UnselectRow(hi.RowHandle);
					}
				});
				view.PostEditor();
				string editorTypeName = hi.Column.ColumnEdit.EditorTypeName;
				if (editorTypeName == "CheckEdit")
				{
					if (isSelected && mouseEventType == "MouseDown")
					{
						bool flag = Convert.ToBoolean(view.GetRowCellValue(hi.RowHandle, hi.Column));
						view.SetRowCellValue(hi.RowHandle, hi.Column, !flag);
					}
				}
				else
				{
					view.ShowEditor();
				}
			}
			catch
			{
			}
		}

		private static void GridViewKeppSelection_SelectionChanged(object sender, SelectionChangedEventArgs e)
		{
			GridView gridView = (GridView)sender;
			RefreshStyleSelectedRow(gridView);
		}

		private static void RefreshStyleSelectedRow(GridView gridView)
		{
			for (int i = 0; i < gridView.RowCount; i++)
			{
				gridView.SetRowCellValue(i, nameColStyleSelected, false);
			}
			int[] selectedRows = gridView.GetSelectedRows();
			int[] array = selectedRows;
			foreach (int rowHandle in array)
			{
				gridView.SetRowCellValue(rowHandle, nameColStyleSelected, true);
			}
		}

		private static void GridViewKeppSelection_DataSourceChanged(object sender, EventArgs e)
		{
			GridControl gridControl = (GridControl)sender;
			AddColumnStyleSelected(gridControl);
		}

		private static void AddColumnStyleSelected(GridControl gridControl)
		{
			if (gridControl.DataSource == null)
			{
				return;
			}
			DataTable dataTable = (DataTable)gridControl.DataSource;
			if (dataTable.Columns[nameColStyleSelected] == null)
			{
				dataTable.Columns.Add(nameColStyleSelected, typeof(bool));
			}
			foreach (DataRow row in ((DataTable)gridControl.DataSource).Rows)
			{
				row[nameColStyleSelected] = false;
			}
		}
	}

	public static string GetSQLDateTime(DateTime dt)
	{
		return string.Format("{0}-{1}-{2}", dt.Year.ToString(), dt.Month.ToString("00"), dt.Day.ToString("00"));
	}

	public static string GetCrystalFullDateTime(DateTime dt)
	{
		return string.Format("DateTime ({0}, {1}, {2}, 00, 00, 00)", dt.Year.ToString(), dt.Month.ToString("00"), dt.Day.ToString("00"));
	}

	public static string GetCrytalFormatDate(DateTime dt)
	{
		return string.Format("{0},{1},{2}", dt.Year.ToString(), dt.Month.ToString("00"), dt.Day.ToString("00"));
	}

	public static DateTime StringToDateTime(string str)
	{
		return Convert.ToDateTime(str);
	}

	public static string GetStringValue(DataRow row, string columnName)
	{
		if (row == null || row.IsNull(columnName))
		{
			return "";
		}
		return row[columnName].ToString();
	}

	public static string GetDateTimeValue(DataRow row, string columnName)
	{
		if (row == null || row.IsNull(columnName))
		{
			return "";
		}
		return row[columnName].ToString();
	}

	public static int ConvertTextToInt(TextEdit textbox)
	{
		if (textbox.Text.Trim() == "")
		{
			return 0;
		}
		return Convert.ToInt32(textbox.Text);
	}

	public static double ConvertTextToDouble(TextEdit textbox)
	{
		if (textbox.Text.Trim() == "")
		{
			return 0.0;
		}
		return Convert.ToDouble(textbox.Text);
	}

	public static int ConvertObjToInt(object obj)
	{
		if (obj == null)
		{
			return 0;
		}
		return Convert.ToInt32(obj);
	}

	public static void SetFocusRow(GridView gridControlView, string colName, object id)
	{
		if (!gridControlView.IsEmpty)
		{
			gridControlView.GridControl.ForceInitialize();
			gridControlView.ClearSelection();
			int num = gridControlView.LocateByValue(colName, id);
			if (num < 1)
			{
				num = 0;
			}
			if (gridControlView.IsRowVisible(num) == RowVisibleState.Hidden)
			{
				gridControlView.TopRowIndex = num;
			}
			gridControlView.FocusedRowHandle = num;
			gridControlView.SelectRow(num);
		}
	}

	public static void SetFocusRow(GridView gridControlView, int index)
	{
		if ((gridControlView.IsFilterRow(index) && !gridControlView.IsEmpty) || index < 0 || index > gridControlView.DataRowCount - 1)
		{
			index = ((index >= 0 && gridControlView.RowCount - 1 >= 0) ? (gridControlView.RowCount - 1) : 0);
		}
		if (gridControlView.IsRowVisible(index) == RowVisibleState.Hidden)
		{
			gridControlView.TopRowIndex = index;
		}
		gridControlView.FocusedRowHandle = index;
		gridControlView.SelectRow(index);
	}

	public static string Left(string param, int length)
	{
		if (length > param.Length)
		{
			length = param.Length;
		}
		return param.Substring(0, length);
	}

	public static string Right(string param, int length)
	{
		if (length > param.Length)
		{
			length = param.Length;
		}
		return param.Substring(param.Length - length, length);
	}

	public static string StringDateTimeFormat(string strDateTime)
	{
		return $"{Convert.ToDateTime(strDateTime):dd/MM/yyyy}";
	}

	public static string StringDateTimeFormat(DateTime dt)
	{
		return StringDateTimeFormat(dt.ToString());
	}

	public static string ShowInputBoxPassword(string text, string caption)
	{
		Form prompt = new Form();
		prompt.Width = 300;
		prompt.Height = 150;
		prompt.FormBorderStyle = FormBorderStyle.FixedDialog;
		prompt.Text = caption;
		prompt.StartPosition = FormStartPosition.CenterScreen;
		Label value = new Label
		{
			Left = 10,
			Top = 20,
			Text = text
		};
		TextBox textBox = new TextBox
		{
			Left = 10,
			Top = 50,
			Width = 250
		};
		textBox.PasswordChar = '*';
		Button button = new Button
		{
			Text = "Ok",
			Left = 200,
			Width = 60,
			Top = 70,
			DialogResult = DialogResult.OK
		};
		button.Click += delegate
		{
			prompt.Close();
		};
		prompt.Controls.Add(textBox);
		prompt.Controls.Add(button);
		prompt.Controls.Add(value);
		prompt.AcceptButton = button;
		return (prompt.ShowDialog() == DialogResult.OK) ? textBox.Text : "";
	}

	public static string ShowInputBox(string text, string caption)
	{
		Form prompt = new Form();
		prompt.Width = 300;
		prompt.Height = 150;
		prompt.FormBorderStyle = FormBorderStyle.FixedDialog;
		prompt.Text = caption;
		prompt.StartPosition = FormStartPosition.CenterScreen;
		Label value = new Label
		{
			Left = 10,
			Top = 20,
			Text = text
		};
		TextBox textBox = new TextBox
		{
			Left = 10,
			Top = 50,
			Width = 250
		};
		Button button = new Button
		{
			Text = "Ok",
			Left = 200,
			Width = 60,
			Top = 70,
			DialogResult = DialogResult.OK
		};
		button.Click += delegate
		{
			prompt.Close();
		};
		prompt.Controls.Add(textBox);
		prompt.Controls.Add(button);
		prompt.Controls.Add(value);
		prompt.AcceptButton = button;
		return (prompt.ShowDialog() == DialogResult.OK) ? textBox.Text : "";
	}

	public static string TruncateString(this string value, int maxLength)
	{
		if (string.IsNullOrEmpty(value))
		{
			return value;
		}
		return (value.Length <= maxLength) ? value : value.Substring(0, maxLength);
	}

	public static string GetApplicationName()
	{
		string[] array = AppDomain.CurrentDomain.FriendlyName.ToString().Split('.');
		return array[0];
	}
}
