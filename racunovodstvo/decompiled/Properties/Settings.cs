using System.CodeDom.Compiler;
using System.Configuration;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace Properties;

[CompilerGenerated]
[GeneratedCode("Microsoft.VisualStudio.Editors.SettingsDesigner.SettingsSingleFileGenerator", "10.0.0.0")]
internal sealed class Settings : ApplicationSettingsBase
{
	private static Settings defaultInstance = (Settings)(object)SettingsBase.Synchronized((SettingsBase)(object)new Settings());

	public static Settings Default => defaultInstance;

	[DebuggerNonUserCode]
	[ApplicationScopedSetting]
	[DefaultSettingValue("Data Source=.\\sqlexpress2008;Initial Catalog=Advance.Database.Ef.AdvanceContext;Integrated Security=True")]
	[SpecialSetting(/*Could not decode attribute arguments.*/)]
	public string SqlConnectionString => (string)((SettingsBase)this)["SqlConnectionString"];
}
