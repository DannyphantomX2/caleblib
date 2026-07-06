import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Brain, Activity, BarChart2, Zap, AlertCircle, CheckCircle, Info } from 'lucide-react'
import axios from 'axios'
import Btn from '../../components/common/Btn'
import StatCard from '../../components/common/StatCard'
import Badge from '../../components/common/Badge'
import { Sk } from '../../components/common/Skeleton'

const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:5001'
const mlApi = axios.create({ baseURL: ML_URL })

const levelColor = { High: '#10b981', Moderate: '#f59e0b', Low: '#ef4444' }
const levelBg = { High: '#ecfdf5', Moderate: '#fffbeb', Low: '#fef2f2' }
const levelBadge = { High: 'green', Moderate: 'yellow', Low: 'red' }

const FIELD_OPTIONS = {
  Gender: ['Boy', 'Girl'],
  Age: ['1-5', '6-10', '11-15', '16-20', '21-25', '26-30'],
  'Education Level': ['School', 'College', 'University'],
  'Institution Type': ['Government', 'Non Government'],
  'IT Student': ['No', 'Yes'],
  Location: ['Yes', 'No'],
  'Load-shedding': ['Low', 'High'],
  'Financial Condition': ['Poor', 'Mid', 'Rich'],
  'Internet Type': ['Mobile Data', 'Wifi'],
  'Network Type': ['2G', '3G', '4G'],
  'Class Duration': ['0', '1-3', '3-6'],
  'Self Lms': ['No', 'Yes'],
  Device: ['Mobile', 'Tab', 'Computer'],
}

const FIELD_LABELS = {
  Gender: 'Gender',
  Age: 'Age Range',
  'Education Level': 'Education Level',
  'Institution Type': 'Institution Type',
  'IT Student': 'IT Student',
  Location: 'Urban Location',
  'Load-shedding': 'Load Shedding Level',
  'Financial Condition': 'Financial Condition',
  'Internet Type': 'Internet Type',
  'Network Type': 'Network Type',
  'Class Duration': 'Daily Class Duration (hrs)',
  'Self Lms': 'Uses LMS Independently',
  Device: 'Primary Device',
}

const AdminMLAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [form, setForm] = useState({
    Gender: 'Boy', Age: '21-25', 'Education Level': 'University',
    'Institution Type': 'Non Government', 'IT Student': 'Yes',
    Location: 'Yes', 'Load-shedding': 'Low', 'Financial Condition': 'Mid',
    'Internet Type': 'Mobile Data', 'Network Type': '4G',
    'Class Duration': '1-3', 'Self Lms': 'No', Device: 'Mobile'
  })
  const [prediction, setPrediction] = useState(null)

  const { data: modelInfo, isLoading: loadingInfo, error: infoError } = useQuery({
    queryKey: ['ml-model-info'],
    queryFn: async () => { const r = await mlApi.get('/model/info'); return r.data },
    retry: 1
  })

  const { data: insights, isLoading: loadingInsights } = useQuery({
    queryKey: ['ml-insights'],
    queryFn: async () => { const r = await mlApi.get('/analytics/insights'); return r.data },
    retry: 1
  })

  const predictMutation = useMutation({
    mutationFn: async (data) => { const r = await mlApi.post('/predict', data); return r.data },
    onSuccess: (data) => setPrediction(data),
    onError: (e) => alert(e.response?.data?.error || 'Prediction failed')
  })

  const card = {
    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
    borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--card-shadow)'
  }

  const tab = (id, label, icon) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: '9px 18px', borderRadius: 8, border: 'none',
      background: activeTab === id ? 'var(--blue-500)' : 'transparent',
      color: activeTab === id ? '#fff' : 'var(--text-secondary)',
      fontFamily: 'var(--font)', fontWeight: 600, fontSize: 13,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
      transition: 'var(--transition)'
    }}>
      {icon}{label}
    </button>
  )

  if (infoError) return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>ML Analytics</h1>
      <div style={{ ...card, background: '#fef2f2', border: '1px solid #fecaca' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 700, color: '#991b1b', marginBottom: 6 }}>ML Service Offline</p>
            <p style={{ fontSize: 13, color: '#b91c1c', lineHeight: 1.7 }}>The ML microservice is not running. Start it with:</p>
            <code style={{ display: 'block', marginTop: 10, padding: '10px 14px', background: '#1e293b', color: '#e2e8f0', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              cd ~/caleb-resource-library/ml && python3 ml_service.py
            </code>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.35)' }}>
            <Brain size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>ML Student Adaptability Analytics</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Random Forest classifier · 1,205 student records · {modelInfo ? `${modelInfo.accuracy}% accuracy` : 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--page-bg-2)', padding: 4, borderRadius: 10, border: '1px solid var(--card-border)', width: 'fit-content' }}>
        {tab('overview', 'Overview', <Activity size={14} />)}
        {tab('predict', 'Predict', <Zap size={14} />)}
        {tab('insights', 'Insights', <BarChart2 size={14} />)}
      </div>

      {activeTab === 'overview' && (
        <div>
          {loadingInfo ? (
            <div className="stat-grid"><Sk w="100%" h={100} /><Sk w="100%" h={100} /><Sk w="100%" h={100} /><Sk w="100%" h={100} /></div>
          ) : modelInfo && (
            <>
              <div className="stat-grid" style={{ marginBottom: 24 }}>
                <StatCard label="Model Accuracy" value={`${modelInfo.accuracy}%`} icon={CheckCircle} color="#10b981" sub="On 20% held-out test set" />
                <StatCard label="Cross-Val Accuracy" value={`${modelInfo.cv_accuracy}%`} icon={Activity} color="#3b82f6" sub={`±${modelInfo.cv_std}% over 5 folds`} />
                <StatCard label="Training Samples" value={modelInfo.dataset_size.toLocaleString()} icon={Brain} color="#8b5cf6" sub="Student records" />
                <StatCard label="Features Used" value="13" icon={BarChart2} color="#f59e0b" sub="Input variables" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div style={card}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Dataset Distribution</h3>
                  {Object.entries(modelInfo.class_distribution).map(([label, count]) => {
                    const total = Object.values(modelInfo.class_distribution).reduce((a,b) => a+b, 0)
                    const pct = ((count/total)*100).toFixed(1)
                    return (
                      <div key={label} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--page-bg-2)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: levelColor[label], borderRadius: 4 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={card}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Per-Class Performance</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Precision, Recall and F1 broken down by adaptability level</p>
                  {modelInfo.classification_report && ['High', 'Low', 'Moderate'].map(label => {
                    const key = label.toLowerCase()
                    const rep = modelInfo.classification_report[label] || modelInfo.classification_report[key] || {}
                    const precision = rep.precision ? (rep.precision * 100).toFixed(1) : '—'
                    const recall = rep.recall ? (rep.recall * 100).toFixed(1) : '—'
                    const f1 = rep['f1-score'] ? (rep['f1-score'] * 100).toFixed(1) : '—'
                    const color = label === 'High' ? '#10b981' : label === 'Low' ? '#ef4444' : '#f59e0b'
                    return (
                      <div key={label} style={{ marginBottom: 18, padding: '12px 14px', background: 'var(--page-bg-2)', borderRadius: 10, border: '1px solid var(--card-border)' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 10 }}>{label} Adaptability</div>
                        {[['Precision', precision], ['Recall', recall], ['F1 Score', f1]].map(([metric, val]) => (
                          <div key={metric} style={{ marginBottom: 7 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{metric}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color }}>{val}%</span>
                            </div>
                            <div style={{ height: 5, background: 'var(--card-border)', borderRadius: 3 }}>
                              <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 3, opacity: 0.8 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={card}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Confusion Matrix</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Rows = Actual, Columns = Predicted (High / Low / Moderate)</p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '8px 16px', textAlign: 'left', color: 'var(--text-muted)', fontSize: 11 }}>Actual ↓ / Predicted →</th>
                        {['High','Low','Moderate'].map(l => (
                          <th key={l} style={{ padding: '8px 20px', textAlign: 'center', fontWeight: 700, color: levelColor[l] }}>{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modelInfo.confusion_matrix.map((row, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--card-border)' }}>
                          <td style={{ padding: '10px 16px', fontWeight: 700, color: levelColor[['High','Low','Moderate'][i]] }}>{['High','Low','Moderate'][i]}</td>
                          {row.map((val, j) => (
                            <td key={j} style={{ padding: '10px 20px', textAlign: 'center', fontWeight: i===j ? 800 : 400, background: i===j ? `${levelColor[['High','Low','Moderate'][i]]}18` : 'transparent', color: i===j ? levelColor[['High','Low','Moderate'][i]] : 'var(--text-secondary)' }}>
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ ...card, background: 'var(--blue-50)', border: '1px solid var(--blue-200)', marginTop: 20 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Info size={16} color="var(--blue-600)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-600)', marginBottom: 6 }}>Algorithm Details</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      <strong>Multilayer Perceptron (MLP) Neural Network</strong> with two hidden layers (64 and 32 neurons),
                      trained on 80% of 1,205 student records from the Student Adaptability in Online Education dataset.
                      Selected after benchmarking against Logistic Regression (66.8%) and Random Forest (88.4%) — the MLP achieved
                      the highest accuracy at 91.3% with an AUC-ROC of 98.1%.
                      5-fold cross-validation confirms stable performance of <strong>{modelInfo.cv_accuracy}% ± {modelInfo.cv_std}%</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'predict' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Student Profile Input</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(FIELD_OPTIONS).map(([field, options]) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>{FIELD_LABELS[field]}</label>
                  <select value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--page-bg-2)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font)', cursor: 'pointer' }}>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
              <Btn fullWidth loading={predictMutation.isPending} onClick={() => predictMutation.mutate(form)} icon={<Zap size={15} />} style={{ marginTop: 8 }}>
                Predict Adaptability Level
              </Btn>
            </div>
          </div>

          <div>
            {prediction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ ...card, background: levelBg[prediction.prediction], border: `2px solid ${levelColor[prediction.prediction]}30` }}>
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: levelColor[prediction.prediction], textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Predicted Adaptability Level</div>
                    <div style={{ fontSize: 48, fontWeight: 900, color: levelColor[prediction.prediction], letterSpacing: '-0.04em', marginBottom: 8 }}>{prediction.prediction}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{prediction.confidence}% confidence</div>
                  </div>
                </div>

                <div style={card}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Probability Breakdown</h4>
                  {Object.entries(prediction.probabilities).sort((a,b) => b[1]-a[1]).map(([label, pct]) => (
                    <div key={label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: levelColor[label] }}>{label}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--page-bg-2)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: levelColor[label], borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {prediction.recommendations?.length > 0 && (
                  <div style={card}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Recommendations</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {prediction.recommendations.map((rec, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--page-bg-2)', borderRadius: 8, border: '1px solid var(--card-border)' }}>
                          <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center', color: 'var(--text-muted)' }}>
                <Brain size={40} color="var(--card-border)" style={{ marginBottom: 16 }} />
                <p style={{ fontWeight: 600, marginBottom: 6 }}>No prediction yet</p>
                <p style={{ fontSize: 13 }}>Fill in the student profile and click Predict</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div>
          {loadingInsights ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}><Sk w="100%" h={200} /><Sk w="100%" h={200} /></div>
          ) : insights && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { key: 'by_financial_condition', title: 'Adaptability by Financial Condition', note: 'Financial condition is the strongest predictor (17.1% importance)' },
                { key: 'by_internet_type', title: 'Adaptability by Internet Type', note: 'Particularly relevant for Nigerian university students relying on mobile data' },
                { key: 'by_device', title: 'Adaptability by Device Type', note: 'Device access strongly correlates with learning outcomes' },
                { key: 'by_network_type', title: 'Adaptability by Network Type', note: 'Network quality is a key barrier in Nigerian universities' },
              ].map(({ key, title, note }) => (
                <div key={key} style={card}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{note}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {Object.entries(insights[key]).map(([group, levels]) => {
                      const total = Object.values(levels).reduce((a,b) => a+b, 0)
                      return (
                        <div key={group} style={{ flex: 1, minWidth: 140, padding: '14px 16px', background: 'var(--page-bg-2)', borderRadius: 10, border: '1px solid var(--card-border)' }}>
                          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>{group}</div>
                          {Object.entries(levels).map(([level, count]) => (
                            <div key={level} style={{ marginBottom: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Badge color={levelBadge[level]}>{level}</Badge>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{((count/total)*100).toFixed(0)}%</span>
                              </div>
                              <div style={{ height: 5, background: 'var(--card-border)', borderRadius: 3 }}>
                                <div style={{ height: '100%', width: `${(count/total)*100}%`, background: levelColor[level], borderRadius: 3 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div style={{ ...card, background: 'var(--blue-50)', border: '1px solid var(--blue-200)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--blue-600)' }}>Key Findings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Financial condition is the strongest predictor of student adaptability (17.1% importance), followed by class duration (14.6%) and age (12.8%).',
                    'Students using WiFi consistently show higher adaptability rates compared to mobile data users — directly relevant to Nigerian campuses with poor connectivity.',
                    'Computer users show higher High-adaptability rates than mobile-only students, supporting investment in computer lab access.',
                    '4G network users show significantly better adaptability outcomes than 2G/3G users — aligning with Nigeria\'s ongoing network infrastructure gaps.',
                    'Students using LMS independently (Self LMS = Yes) show notably better adaptability, validating the purpose of CalebLib as a self-directed learning tool.'
                  ].map((finding, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue-600)', flexShrink: 0 }}>{i+1}.</span>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{finding}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminMLAnalytics
