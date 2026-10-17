using System.IO;
using System.Reflection;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using ValheimPlusPlus;
using ValheimPlusPlus.Desktop;

// Offline documentation fixtures only. Never opens or launches a real game/profile.
class Program
{
 [STAThread] static int Main(string[] args)
 {
  var site=Path.GetFullPath(args[0]);var output=Path.Combine(site,"assets","images");
  var profile=Path.Combine(Path.GetTempPath(),"vh-site-capture-"+Guid.NewGuid().ToString("N"));
  Directory.CreateDirectory(profile);
  using var json=JsonDocument.Parse(File.ReadAllText(Path.Combine(site,"assets/data/releases.json")));
  var releases=json.RootElement.GetProperty("releases").EnumerateArray()
   .Where(r=>r.GetProperty("tag_name").GetString()!.StartsWith("modpack-v"))
   .Select(r=>new CatalogRelease(ReleaseProduct.ModpackStable,Version.Parse(r.GetProperty("tag_name").GetString()![9..]),r.GetProperty("tag_name").GetString()!,"https://example.org/modpack.json",r.GetProperty("published_at").GetDateTimeOffset(),r.GetProperty("body").GetString()??""))
   .OrderByDescending(r=>r.Version).ToArray();
  string Summary(string body){var m=System.Text.RegularExpressions.Regex.Match(body,@"<!--s*vh-center-summary:v1s*-->s*(.*?)s*<!--",System.Text.RegularExpressions.RegexOptions.Singleline);return m.Success?System.Text.RegularExpressions.Regex.Replace(m.Groups[1].Value.Replace("*",""),@"^W skrócie:s*","").Trim():"";}
  var launcherReleases=json.RootElement.GetProperty("releases").EnumerateArray()
   .Where(r=>r.GetProperty("tag_name").GetString()!.StartsWith("launcher-v"))
   .Select(r=>new CatalogRelease(ReleaseProduct.Launcher,Version.Parse(r.GetProperty("tag_name").GetString()![10..]),r.GetProperty("tag_name").GetString()!,"https://example.org/launcher.json",r.GetProperty("published_at").GetDateTimeOffset(),r.GetProperty("body").GetString()??"",Summary(r.GetProperty("body").GetString()??"")))
   .OrderByDescending(r=>r.Version).ToArray();
  var latest=releases[0];var game=Path.Combine(profile,"valheim.exe");File.WriteAllText(game,"Documentation fixture — not executable");
  new LauncherSettings(GameExe:game,EnableAnimations:false,CheckOnStartup:false).Save(profile);
  Directory.CreateDirectory(Path.Combine(profile,"active"));
  var installed=new Release(latest.Version.ToString(),"https://example.org/pack.zip",new string('a',64),latest.Notes);
  File.WriteAllText(Path.Combine(profile,"active",".release.json"),JsonSerializer.Serialize(installed,Release.Json));
  Directory.CreateDirectory(Path.Combine(profile,"backup"));
  File.WriteAllText(Path.Combine(profile,"backup",".release.json"),JsonSerializer.Serialize(installed with {Version=releases[1].Version.ToString()},Release.Json));
  var app=new Application();var window=new MainWindow(profile,false,true,false){ShowInTaskbar=false,Left=-10000,Top=-10000,WindowStartupLocation=WindowStartupLocation.Manual};
  int result=1;window.Loaded+=(_,_)=>window.Dispatcher.BeginInvoke(DispatcherPriority.ApplicationIdle,new Action(()=>{
   try
   {
    Set("releaseCatalog",new ReleaseCatalog(releases.Concat(launcherReleases).ToArray()));Call("PopulateVersionChoices");
    Save("launcher-home.png");
    ((Button)window.FindName("SettingsButton")).RaiseEvent(new RoutedEventArgs(Button.ClickEvent));
    var tabs=(TabControl)window.FindName("SettingsTabs");
    ((FrameworkElement)window.FindName("BaseContent")).Visibility=Visibility.Hidden;
    tabs.SelectedIndex=0;
    // Display an anonymous example path, never the local capture user's name.
    var gameBox=(TextBox)window.FindName("GameBox");gameBox.Text=@"C:\Steam\steamapps\common\Valheim\valheim.exe";
    ((FrameworkElement)window.FindName("PendingSettingsLabel")).Visibility=Visibility.Collapsed;
    Save("launcher-game.png");gameBox.Text=game;
    tabs.SelectedIndex=1;Save("launcher-settings.png");
    ((Border)window.FindName("VersionChoicesPanel")).Visibility=Visibility.Visible;
    ((Button)window.FindName("BrowseVersionsButton")).Content="Ukryj starsze wydania";
    window.UpdateLayout();((ScrollViewer)window.FindName("UpdateSettingsScroll")).ScrollToVerticalOffset(150);
    Save("launcher-versions.png");
    ((Border)window.FindName("VersionChoicesPanel")).Visibility=Visibility.Collapsed;
    ((ScrollViewer)window.FindName("UpdateSettingsScroll")).ScrollToTop();
    tabs.SelectedIndex=3;Save("launcher-backups.png");
    ((FrameworkElement)window.FindName("SettingsPanel")).Visibility=Visibility.Collapsed;
    ((FrameworkElement)window.FindName("BaseContent")).Visibility=Visibility.Visible;
    var feedback=(UpdateCheckView)window.FindName("CheckFeedback");feedback.Visibility=Visibility.Visible;
    ((FrameworkElement)window.FindName("BaseContent")).Effect=new System.Windows.Media.Effects.BlurEffect{Radius=9};
    feedback.ShowState("update","Wykryto aktualizację!",latest.Notes,false);feedback.SetVersionTransition(releases[1].Version.ToString(),latest.Version.ToString());
    Save("launcher-update.png");feedback.Visibility=Visibility.Collapsed;
    ((FrameworkElement)window.FindName("BaseContent")).Effect=null;
    var repair=Find<RepairView>((DependencyObject)window.Content)!;
    if(repair is null)throw new Exception("Missing repair view");
    ((FrameworkElement)window.FindName("BaseContent")).Effect=new System.Windows.Media.Effects.BlurEffect{Radius=9};
    repair.Visibility=Visibility.Visible;repair.ShowScanResult(["BepInEx/plugins/OdinHorse/OdinHorse.dll"]);Save("launcher-repair.png");
    repair.Visibility=Visibility.Collapsed;((FrameworkElement)window.FindName("BaseContent")).Effect=null;
    var flags=BindingFlags.NonPublic|BindingFlags.Instance;
    ((Task)typeof(MainWindow).GetMethod("ShowReleaseHistoryAsync",flags)!.Invoke(window,[false])!).GetAwaiter().GetResult();
    Save("launcher-history.png");
    typeof(MainWindow).GetMethod("DismissHistory",flags)!.Invoke(window,[false]);
    typeof(MainWindow).GetMethod("OpenMods",flags)!.Invoke(window,null);
    var mods=(ModView)window.FindName("ModsPanel");
    string[] names=["BetterArchery","CartographySkill","CookingAdditions","HUDCompass","MouseTweaks","OdinHorse","PlantEasily","VNEI","Własny mod"];
    var list=names.Select((n,i)=>new ModEntry(Guid.NewGuid().ToString("N"),n,i==8?"1.0.0":null,i==8?ModOrigin.Custom:ModOrigin.Pack,i==4?ModState.Disabled:ModState.Enabled,["BepInEx/plugins/"+n+"/"+n+".dll"])).ToArray();
    mods.Render("Codzienna wyprawa",list,true);Save("launcher-mods.png");
    typeof(MainWindow).GetMethod("HideMods",flags)!.Invoke(window,null);
    var store=(LauncherProfileStore)typeof(MainWindow).GetField("profileStore",flags)!.GetValue(window)!;
    var avatars=(ProfileAvatarStore)typeof(MainWindow).GetField("profileAvatars",flags)!.GetValue(window)!;
    store.Create("Testy bety",true,"seer");
    var registry=store.Load();
    foreach(var p in registry.Profiles){var dir=store.InstallationPath(p);Directory.CreateDirectory(dir);File.WriteAllText(Path.Combine(dir,".release.json"),JsonSerializer.Serialize(installed,Release.Json));}
    var describe=(Func<LauncherProfile,string>)Delegate.CreateDelegate(typeof(Func<LauncherProfile,string>),window,typeof(MainWindow).GetMethod("DescribeProfilePack",flags)!);
    var picker=new ProfilePickerWindow(registry,avatars,describe){Owner=window,ShowInTaskbar=false,Left=-10000,Top=-10000,WindowStartupLocation=WindowStartupLocation.Manual};
    picker.Show();((Border)picker.Content).Background=picker.Background;picker.UpdateLayout();SaveVisual((FrameworkElement)picker.Content,"launcher-profiles.png");picker.Close();
    var reportDialog=new ReportDialog(window,(d,n,f,ct)=>Task.FromException<ReportSnapshot>(new InvalidOperationException("fixture")),new ReportClient(),new ReportAccessStore(profile)){ShowInTaskbar=false,Left=-10000,Top=-10000,WindowStartupLocation=WindowStartupLocation.Manual};
    reportDialog.Show();
    ((TextBox)reportDialog.Control("Nickname")).Text="Gracz";
    ((TextBox)reportDialog.Control("Problem")).Text="Po aktualizacji paczki gra nie uruchamia się. Launcher pokazuje błąd przy starcie.";
    ((CheckBox)reportDialog.Control("Full")).IsChecked=true;
    reportDialog.UpdateLayout();SaveVisual((FrameworkElement)reportDialog.Content,"launcher-report.png");
    ((TextBox)reportDialog.Control("Nickname")).Text="";((TextBox)reportDialog.Control("Problem")).Text="";((CheckBox)reportDialog.Control("Full")).IsChecked=false;reportDialog.Close();
    var failure=LauncherFailure.Create(new System.Net.Http.HttpRequestException(),"Sprawdzanie aktualizacji","1.0.0",latest.Version.ToString(),false);
    var dialog=new FailureDialog(window,failure){ShowInTaskbar=false,Left=-10000,Top=-10000,WindowStartupLocation=WindowStartupLocation.Manual};
    dialog.Show();SaveVisual((FrameworkElement)dialog.Content,"launcher-error.png");dialog.Close();
    result=0;Console.WriteLine("PASS: 12 screenshots, current WPF UI, no mouse cursor");
   }
   catch(Exception error){Console.Error.WriteLine(error);}
   finally{window.Close();app.Shutdown();}
  }));
  window.Show();app.Run();Directory.Delete(profile,true);return result;
  void Set(string name,object value)=>typeof(MainWindow).GetField(name,BindingFlags.NonPublic|BindingFlags.Instance)!.SetValue(window,value);
  void Call(string name)=>typeof(MainWindow).GetMethod(name,BindingFlags.NonPublic|BindingFlags.Instance)!.Invoke(window,null);
  void Save(string name)
  {
   window.UpdateLayout();SaveVisual((FrameworkElement)window.Content,name);
  }
  void SaveVisual(FrameworkElement content,string name)
  {
   content.UpdateLayout();
   var bitmap=new RenderTargetBitmap((int)content.ActualWidth*2,(int)content.ActualHeight*2,192,192,PixelFormats.Pbgra32);bitmap.Render(content);
   var encoder=new PngBitmapEncoder();encoder.Frames.Add(BitmapFrame.Create(bitmap));using var file=File.Create(Path.Combine(output,name));encoder.Save(file);
  }
 }
 static T? Find<T>(DependencyObject parent) where T:DependencyObject
 {
  if(parent is T match)return match;
  for(int i=0;i<VisualTreeHelper.GetChildrenCount(parent);i++){var result=Find<T>(VisualTreeHelper.GetChild(parent,i));if(result is not null)return result;}return null;
 }
}
