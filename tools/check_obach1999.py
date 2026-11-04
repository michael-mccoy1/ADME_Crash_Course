import math, json
# drug, class, fu_plasma, B:P, CLblood_actual (nonrenal, mL/min/kg), CLint scaled (mL/min/kg), fu_mic   [Obach 1999 Tables 2 and 3]
D=[
("Chlorpromazine","base",0.05,0.78,11,25,0.11),("Propafenone","base",0.04,0.70,19,166,0.26),("Verapamil","base",0.10,0.77,19,122,0.43),
("Diphenhydramine","base",0.22,0.65,9.5,2.1,0.29),("Lorcainide","base",0.15,0.77,18,50,0.52),("Diltiazem","base",0.22,1.0,12,15,0.76),
("Amitriptyline","base",0.05,0.86,12,14,0.15),("Desipramine","base",0.18,0.96,12,17,0.21),("Imipramine","base",0.10,1.1,12,19,0.18),
("Ketamine","base",0.88,0.82,20,27,0.49),("Quinidine","base",0.13,0.92,2.7,3.4,0.32),("Clozapine","base",0.05,0.87,2.9,4.6,0.13),
("Dexamethasone","neutral",0.32,0.93,3.8,3.0,1.00),("Prednisone","neutral",0.25,0.83,4.9,2.7,0.20),("Diazepam","neutral",0.013,0.71,0.6,2.3,0.28),
("Midazolam","neutral",0.05,0.53,8.7,160,0.88),("Methoxsalen","neutral",0.09,0.67,18,40,0.94),("Alprazolam","neutral",0.32,0.78,0.76,1.6,0.66),
("Triazolam","neutral",0.10,0.62,4.7,19,0.78),("Zolpidem","neutral",0.08,0.76,5.7,2.8,0.58),
("Diclofenac","acid",0.005,0.55,7.6,189,1.00),("Ibuprofen","acid",0.01,0.55,1.5,8.8,0.84),("Tolbutamide","acid",0.04,0.55,0.36,0.90,0.95),
("Warfarin","acid",0.01,0.55,0.081,0.52,0.47),("Tenidap","acid",0.0007,0.56,0.10,8.3,0.32),("Tenoxicam","acid",0.009,0.67,0.03,1.7,0.78),
("Amobarbital","acid",0.39,1.5,0.35,0.94,0.76),("Hexobarbital","acid",0.53,1.0,3.6,2.3,0.81),("Methohexital","acid",0.27,0.70,16,49,0.86)]
Q=21.0
def ws(q,cl): return q*cl/(q+cl)
def pt(q,cl): return q*(1-math.exp(-cl/q))
def preds(fub,fm,cl):
    return [ws(Q,cl), ws(Q,fub*cl), ws(Q,fub*cl/fm), pt(Q,cl), pt(Q,fub*cl), pt(Q,fub*cl/fm)]
def afe(p,a): return 10**(sum(abs(math.log10(x/y)) for x,y in zip(p,a))/len(a))
rows=[]
for n,c,fp,bp,act,cli,fm in D:
    rows.append((n,c,act,preds(fp/bp,fm,cli)))
exp={"Chlorpromazine":[11,1.5,8.6,15,1.5,11],"Midazolam":[19,8.8,9.4,21,11,12],"Diclofenac":[19,1.6,1.6,21,1.6,1.6],"Warfarin":[0.46,0.01,0.02,0.46,0.01,0.02],"Propafenone":[19,6.5,13,21,7.6,17]}
for n,c,a,p in rows:
    if n in exp: print(n,'mine',[round(x,2) for x in p],'paper',exp[n])
print()
paper={"base":[1.37,5.17,1.86,1.31,4.75,1.60],"neutral":[1.99,3.90,2.55,1.99,3.90,2.53],"acid":[5.05,3.91,2.83,5.35,3.79,2.74],"all":[2.28,4.39,2.31,2.28,4.20,2.14]}
for k in ["base","neutral","acid","all"]:
    sel=[r for r in rows if k=="all" or r[1]==k]
    mine=[round(afe([r[3][i] for r in sel],[r[2] for r in sel]),2) for i in range(6)]
    print(k,len(sel),'mine',mine,'paper',paper[k])
json.dump([dict(drug=n,cls=c,fu_plasma=fp,bp=bp,cl_blood_obs=act,clint=cli,fu_mic=fm) for n,c,fp,bp,act,cli,fm in D],open(r'C:\Users\qit5997\AppData\Local\Temp\claude\38ca4062b4477634\a7e0a743-158e-4e1a-9809-008d5f1aac5c\scratchpad\obach1999.json','w'),indent=1)
