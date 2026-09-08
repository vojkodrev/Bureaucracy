using System;
using System.Windows.Forms;

namespace Racunovodstvo;

internal static class Program
{
	[STAThread]
	private static void Main()
	{
		Application.EnableVisualStyles();
		Application.SetCompatibleTextRenderingDefault(false);
		frmIzberiNastavitev frmIzberiNastavitev2 = new frmIzberiNastavitev();
		((Control)frmIzberiNastavitev2).Show();
		Application.Run();
	}
}
