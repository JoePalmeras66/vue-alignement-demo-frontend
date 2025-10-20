# For documentation please check https://dev.azure.com/TGW-Software/Markdown2Confluence
param(
	[string[]]$BranchId
)

. "$PsScriptRoot/md-apis.ps1"

Write-Host "Lookup required configs"
try{
    $cSpace = "${env:CONFLUENCE-SPACE}";
    $cUrl = "${env:CONFLUENCE-ROOT-URL}";
    $cUser = "${env:CONFLUENCE-USERNAME}";
    $cPass = "${env:CONFLUENCE-PASSWORD}";
    $cTopLevel = "${env:CONFLUENCE-TOP-LEVEL-PAGE}";

    Write-Host "  | Space : $cSpace"
    Write-Host "  | URL : $cUrl"
    Write-Host "  | User : $cUser"
    Write-Host ""
}catch{
    Write-Error "Please configure required configs in Library group"
}

Write-Host "Lookup branch info"

$GitBranch = $env:BUILD_SOURCEBRANCH
$GitBranch = "$GitBranch".substring(11)
$friendlyBranch = $BranchId
if(("$BranchId" -eq "Automatic") -or ("$BranchId" -eq "")){
    $BranchId = "$GitBranch"
    $friendlyBranch = GetFriendlyBranchName $BranchId
}

Write-Host "  | Name : $BranchId"
Write-Host "  | Friendly: $friendlyBranch"
Write-Host "  | Git: $GitBranch"
Write-Host ""

Write-Host "Lookup commit info"
$commitId = $env:BUILD_SOURCEVERSION
Write-Host "  | $commitId"
Write-Host ""



Write-Host "Lookup docs location"
$docsSubDirectory = $env:RESOLVEDDOCS;
if("$docsSubDirectory" -eq ""){
    Write-Host "  | Could not resolve DocumentationDirectory"
    $docsSubDirectory = "docs"
}
Write-Host "  | Use: $docsSubDirectory"
Write-Host ""

Write-Host "Lookup top level"
Write-Host "  | From library : '$cTopLevel'"

if("$cTopLevel" -eq ""){
    $cTopLevelDefault = "Release Documentation"
    Write-Host "    | Not set - use default '$cTopLevelDefault'"
    $cTopLevel = $cTopLevelDefault
}


$yearMonthDate = ((get-date).ToUniversalTime().tostring("yyyy.MM.dd"))
$pageFooter = "Created at $yearMonthDate for ``$GitBranch`` @ ``$commitId``"


Write-Host "Headers to inject:"
Write-Host "  | TitleSuffix : $friendlyBranch"
Write-Host "  | CommitId : $commitId"
Write-Host "  | PageFooter : $PageFooter"
Write-Host "  | Label : $BranchId"
Write-Host ""


$sources = $env:BUILD_SOURCESDIRECTORY
$docsAbsolute = "$sources/$docsSubDirectory";
Write-Host "Search for *.md in '$docsAbsolute'"
$mdFiles = Get-ChildItem -Path $docsAbsolute -Filter "*.md" -Recurse

Write-Host ""
Write-Host "Inject Header"
foreach($mdFile in $mdFiles){
    Write-Host "  | $mdFile"

    $title = GetMDTitleFromFileName -FullFilePath $mdFile
    $parent = GetMDParentFromFileName -FullFilePath $mdFile -docsRoot $docsAbsolute

    $title = "$title ($friendlyBranch)"
    if("$parent" -eq ""){
        Write-Host "     | No parent found - use '$friendlyBranch'"
        $parent = "Entree Git-Branch - $friendlyBranch"
    }else{
        $parent = "$parent ($friendlyBranch)"
    }
    
    Inject-MD-Header -mdFile $mdFile -space $cspace -parent $parent -title $title -branchid $BranchId -pageFooter $pageFooter
}

# we need to make sure that parent node 'CONFLUENCE-TOP-LEVEL-PAGE' is used,
# therefore we need to create a md for that node and list it as parent of 'BranchId'. 
# Need to make sure however that it is enumerated first during later upload.
$topLevelFile = "$docsAbsolute/00-TopLevel.md"
$topLevelContent = '';
Write-Host "Generate Top Level Page $topLevelFile"
[System.IO.File]::WriteAllText($topLevelFile, $topLevelContent)
Inject-MD-Header -mdFile $topLevelFile -space $cspace -parent $cTopLevel -title "Entree Git-Branch - $friendlyBranch" -branchid $BranchId -pageFooter $pageFooter
